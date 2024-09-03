import { event } from '../utils';
import { VoiceState, PermissionsBitField, CategoryChannel, VoiceChannel, Guild, GuildMember, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType, DiscordAPIError } from 'discord.js';
import { db } from '../utils';

interface ServersVoices {
    voiceCategoryName?: string;
    voiceChannelName?: string;
}

export default event('voiceStateUpdate', async (_client, oldState: VoiceState, newState: VoiceState) => {

    const guild: Guild | undefined = newState.guild;
    const guildId = guild?.id;

    if (!guild) {
        console.log('Guild not found');
        return;
    }

    let voiceCategoryName: string | undefined;
    let voiceChannelName: string | undefined;

    try {
        await new Promise<void>((resolve, reject) => {
            db.get('SELECT voiceCategoryName, voiceChannelName FROM servers_voices WHERE guildId = ?', [guildId], (err, row: ServersVoices) => {
                if (err) {
                    console.error(`Error when retrieving the "voiceCategoryName" or/and "voiceChannelName" parameters from the database for server ${guildId}. \nError:\n`, err);
                    return reject(err);
                }

                voiceCategoryName = row?.voiceCategoryName;
                voiceChannelName = row?.voiceChannelName;
                resolve();
            });
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Database retrieval failed:', error.message);
        } else {
            console.error('An unknown error occurred during database retrieval.');
        }
        return;
    }

    if (!voiceCategoryName || !voiceChannelName) {
        console.error(`Missing voice category or channel name for server ${guildId}.`);
        return;
    }

    if (newState.channelId && newState.channel) {
        const category = newState.channel.parent as CategoryChannel | null;

        if (newState.channel.name === voiceChannelName && category?.name === voiceCategoryName) {
            const member: GuildMember | null = newState.member;

            if (!member) {
                console.log('Member not found');
                return;
            }

            const channelName = `${member.displayName}'s Channel`;

            try {
                const voiceChannel: VoiceChannel = await guild.channels.create({
                    name: channelName,
                    type: 2,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: member.id,
                            allow: [
                                PermissionsBitField.Flags.Connect,
                                PermissionsBitField.Flags.ManageChannels,
                                PermissionsBitField.Flags.MoveMembers,
                                PermissionsBitField.Flags.PrioritySpeaker
                            ],
                        },
                        {
                            id: guild.roles.everyone.id,
                            allow: [PermissionsBitField.Flags.Connect],
                        }
                    ],
                }) as unknown as VoiceChannel;

                await member.voice.setChannel(voiceChannel);
            } catch (error) {
                if (error instanceof Error) {
                    console.error('Error creating or moving to the voice channel:', error.message);
                } else {
                    console.error('An unknown error occurred while creating the voice channel.');
                }
            }
        }
    }

    if (oldState.channel && oldState.channel.members.size === 0) {
        const channel = oldState.channel as VoiceChannel;

        if (channel.name.endsWith("'s Channel") && channel.parent?.name === voiceCategoryName) {
            try {
                await channel.delete();
            } catch (error) {
                if (error instanceof DiscordAPIError && error.code === 10003) {
                    console.log(`The ${channel.name} voice room no longer exists, so it cannot be deleted.`);
                } else if (error instanceof Error) {
                    console.error('Error deleting the voice channel:', error.message);
                } else {
                    console.error('An unknown error occurred while deleting the voice channel.');
                }
            }
        }
    } else if (oldState.channel && oldState.channel.members.size > 0) {
        const channel = oldState.channel as VoiceChannel;
        const owner = oldState.member as GuildMember;

        if (channel.permissionOverwrites.cache.has(owner.id) && channel.members.size > 0) {
            const button = new ButtonBuilder()
                .setCustomId('claim_ownership_voice')
                .setLabel('Claim Ownership')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

            const message = await channel.send({
                content: `The owner of the **${channel.name}** voice room has left. You have one minute to recover ownership of the salon by clicking on the button below.`,
                components: [row],
            });

            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 60000, // 1 minute
            });

            collector.on('collect', async interaction => {
                if (interaction.customId === 'claim_ownership_voice') {
                    const newOwner = interaction.member as GuildMember;

                    if (channel.members.has(newOwner.id)) {
                        try {
                            await channel.permissionOverwrites.edit(newOwner.id, {
                                Connect: true,
                                ManageChannels: true,
                                MoveMembers: true,
                                PrioritySpeaker: true,
                            });

                            await channel.permissionOverwrites.delete(owner.id);

                            await interaction.reply({
                                content: `${newOwner}, you are now the owner of the **${channel.name}** voice room.`,
                                ephemeral: true,
                            });
                        } catch (error) {
                            if (error instanceof Error) {
                                console.error('Error transferring ownership:', error.message);
                            } else {
                                console.error('An unknown error occurred while transferring ownership.');
                            }
                        }
                    } else {
                        await interaction.reply({
                            content: "You must be in the voice lounge to retrieve the property.",
                            ephemeral: true,
                        });
                    }
                }
            });

            collector.on('end', async collected => {
                if (!collected.size) {
                    await message.edit({
                        content: `The time to claim ownership of the **${channel.name}** voice room has expired. The channel will be deleted.`,
                        components: [],
                    });

                    try {
                        await channel.delete();
                        console.log(`The ${channel.name} voice room has been deleted because the property has not been recovered.`);
                    } catch (error) {
                        if (error instanceof DiscordAPIError && error.code === 10003) {
                            console.log(`The ${channel.name} voice room no longer exists, so it cannot be deleted.`);
                        } else if (error instanceof Error) {
                            console.error('Error deleting the voice channel:', error.message);
                        } else {
                            console.error('An unknown error occurred while deleting the voice channel.');
                        }
                    }
                }
            });
        }
    }
});
