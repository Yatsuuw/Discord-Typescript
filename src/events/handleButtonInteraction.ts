import { EmbedBuilder, PermissionsBitField, TextChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMemberRoleManager, CategoryChannel, GuildChannel, ButtonInteraction } from 'discord.js';
import { db } from '../utils';

interface Tickets_Settings {
    ticketsModId?: string;
    ticketsName?: string;
}

interface ServersSettings {
    logChannelId?: string;
}

export const handleButtonInteraction = async (interaction: ButtonInteraction, log: Function) => {

    if (!interaction.isButton()) return;

    const ticketRelatedIds = ['claim_ticket', 'close_ticket', 'help_ticket'];
    if (!ticketRelatedIds.some(id => interaction.customId.startsWith(id))) return;

    const guild = interaction.guild;
    const guildName = guild?.name;
    const guildId = guild?.id;

    if (!guild) return;

    const member = interaction.member;
    if (!member || !('displayName' in member)) return;

    db.get('SELECT ticketsName, ticketsModId FROM servers_tickets WHERE guildId = ?', [guild.id], async (err, row: Tickets_Settings) => {
        if (err) {
            console.error('Error retrieving ticket parameters:', err);
            return;
        }

        db.get('SELECT logChannelId FROM servers_settings WHERE guildId = ?', [guild.id], async (err, rows: ServersSettings) => {
            if (err) {
                console.error('Error retrieving the "logChannelId" parameter:', err);
                return;
            }

            const logChannelId = rows?.logChannelId;

            if (logChannelId) {
                try {
                    const logChannel = interaction.guild?.channels.cache.get(logChannelId) as TextChannel;

                    if (logChannel) {
                        const ticketsName = row?.ticketsName || 'tickets';
                        const ticketsModId = row?.ticketsModId || `${guild.roles.everyone.id}`;

                        if (!ticketsModId) {
                            interaction.reply({ content: 'Error: The moderation role ID for tickets is not defined.' });
                            return;
                        }

                        if (interaction.customId === 'claim_ticket') {
                            if (!(member.roles as GuildMemberRoleManager).cache.has(ticketsModId)) {
                                await interaction.reply({ content: `You do not have the <@&${ticketsModId}> role required to support this ticket.`, ephemeral: true });
                                return;
                            }

                            const channel = interaction.channel as TextChannel;
                            if (!channel) return;

                            await channel.permissionOverwrites.edit(member.user.id, {
                                ManageChannels: true,
                                ManageMessages: true,
                                SendMessages: true,
                            });

                            await interaction.reply({ content: `Ticket supported by <@${member.user.id}>.`, ephemeral: false });

                        } else if (interaction.customId === 'close_ticket') {
                            try {
                                const channel = interaction.channel as TextChannel;
                                if (!channel) return;

                                const closeEmbed = new EmbedBuilder()
                                    .setTitle('Ticket System')
                                    .setDescription(`${channel.name} has been deleted by <@${interaction.user.id}>`)
                                    .setColor('Red')
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' });

                                await interaction.reply({ content: 'This ticket will be closed in 5 seconds...', ephemeral: false });
                                setTimeout(() => channel.delete(), 5000);
                                await logChannel.send({ embeds: [closeEmbed] });
                            } catch (error) {
                                interaction.reply({ content: `Error retrieving the log room for server ${guildName} (${guildId}). Error: ${error}`, ephemeral: true });
                            }
                        } else {
                            const ticketType = interaction.customId.split('_')[0];
                            const channelName = `${ticketType}-${interaction.user.username}-${Date.now()}`;

                            let category = guild.channels.cache.find(
                                c => c.name.toLowerCase() === ticketsName.toLowerCase() && c.type === 4
                            ) as CategoryChannel;

                            if (!category) {
                                category = await guild.channels.create({
                                    name: ticketsName,
                                    type: 4,
                                }) as unknown as CategoryChannel;

                                try {
                                    const categoryCreated = new EmbedBuilder()
                                        .setTitle('Ticket System')
                                        .setDescription('The category for the ticket system has been created.')
                                        .setColor('DarkGreen')
                                        .setTimestamp()
                                        .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' });

                                    log(`[Tickets] Category "${ticketsName}" created with ID: ${category.id}`);
                                    await logChannel.send({ embeds: [categoryCreated] });
                                } catch (error) {
                                    interaction.reply({ content: `An error has occurred while creating the tickets category for server ${guildName} (${guildId}). Error: ${error}`, ephemeral: true });
                                }
                            }

                            const channel = await guild.channels.create({
                                name: channelName,
                                type: 0,
                                parent: category.id,
                                permissionOverwrites: [
                                    {
                                        id: guild.id,
                                        deny: [PermissionsBitField.Flags.ViewChannel],
                                    },
                                    {
                                        id: interaction.user.id,
                                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory],
                                    },
                                    {
                                        id: ticketsModId,
                                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ManageChannels],
                                    },
                                    {
                                        id: guild.roles.everyone.id,
                                        deny: [PermissionsBitField.Flags.ViewChannel],
                                    }
                                ],
                            });

                            const embed = new EmbedBuilder()
                                .setTitle(` ${ticketType === 'help' ? "Help Ticket" : 'Suggestion Ticket'}`)
                                .setDescription(`Please describe in detail your ${ticketType === 'help' ? "problem" : 'suggestion'} below.`)
                                .setColor(ticketType === 'help' ? 'Green' : 'Purple');

                            const row = new ActionRowBuilder<ButtonBuilder>()
                                .addComponents(
                                    new ButtonBuilder()
                                        .setCustomId('claim_ticket')
                                        .setLabel('Taking charge')
                                        .setStyle(ButtonStyle.Primary),
                                    new ButtonBuilder()
                                        .setCustomId('close_ticket')
                                        .setLabel('Close the ticket')
                                        .setStyle(ButtonStyle.Danger)
                                );

                            try {
                                const ticketCreated = new EmbedBuilder()
                                    .setTitle('Ticket System Information')
                                    .setDescription(`A new ticket was created. Ticket type: ${ticketType === 'help' ? "Help Ticket" : 'Suggestion Ticket'}`)
                                    .setColor(ticketType === 'help' ? 'Green' : 'Purple')
                                    .setTimestamp()
                                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' });

                                await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
                                await interaction.reply({ content: `Your ticket has been created: ${channel}`, ephemeral: true });
                                await logChannel.send({ embeds: [ticketCreated] });
                            } catch (error) {
                                interaction.reply({ content: `An error has occurred while sending tickets messages for server ${guildName} (${guildId}). Error: ${error}`, ephemeral: true });
                            }
                        }
                    } else {
                        interaction.reply({ content: `The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`, ephemeral: true });
                    }
                } catch (error) {
                    console.error(`The log channel with ID ${logChannelId} was not found for server ${guildName} (${guildId}).`);
                }
            }
        });
    });
};
