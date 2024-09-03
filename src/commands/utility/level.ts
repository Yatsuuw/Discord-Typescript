import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { command } from '../../utils';
import { db } from '../../utils';

interface Levels {
    guildId?: string,
    userId?: string,
    level?: number,
    experience?: number,
}

const meta = new SlashCommandBuilder ()
    .setName('level')
    .setDescription('Send the level for the user who was executed this command.')
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('User to see the level')
            .setRequired(true)
    )

export default command(meta, async ({ interaction }) => {
    const guildId = String(interaction.guild?.id);
    const target = interaction.options.getMember('target') as GuildMember;

    if (interaction.guild) {

        db.get(`SELECT level, experience FROM levels WHERE guildId = ? AND userId = ?`, [guildId, target.id], (err, row: Levels) => {
            if (err) {
                console.error('Error retrieving user level :', err);
                return;
            }
    
            if (!row) {
                interaction.reply({ content: 'The user does not yet have a registered level.', ephemeral: true });
            } else {
                const level = row?.level || 1;
                const experience = row?.experience || 0;
                const requiredXp = Math.floor(Math.pow(level + 1, 1.5) * 50); // Change the value to "1.5" or "50" to reduce or increase the experience required to pass levels.

                const levelEmbed = new EmbedBuilder()
                    .setTitle(`${target.user.username}'s rank`)
                    .setDescription(`Level and points of the user experience of <@${target.id}>.`)
                    .setColor('Blue')
                    .addFields([
                        { name: 'Level', value: `${level}` },
                        { name: 'Experience', value: `${experience}` },
                        { name: 'Required experience for the next level', value: `${requiredXp - experience}` }
                    ])
                    .setTimestamp()
                    .setFooter({ text: "By yatsuuw @ Discord", iconURL: 'https://media.discordapp.net/attachments/1280662607212314715/1280662682533363743/favicon.png?ex=66d8e591&is=66d79411&hm=9c74475031c6396856ac6574232d3946ede7a1495d8269fc0cbd470408aebf66&=&format=webp&quality=lossless&width=350&height=350' })

                interaction.reply({ embeds: [levelEmbed] })
            }
        });

    } else { return; }
})
