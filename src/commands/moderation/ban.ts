import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('ban')
    .setDescription('Bannir un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('Utilisateur à bannir')
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('reason')
            .setDescription('Raison du bannissement')
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
        const target = interaction.options.getMember('target') as GuildMember;
        const reason = interaction.options.getString('reason') || 'No reason.';

        if (!target.bannable) return await interaction.reply({ content: 'Ce membre ne peut pas être banni.', ephemeral: true });
        
        //if (!target.kickable) console.log(`${target.user.username} ne peut pas être banni`);
        //if (target.kickable) console.log(`${target.user.username} a été banni`)

        const banServer = new EmbedBuilder()
            .setTitle("Bannissement")
            .setColor("Red")
            .setDescription("Malheureusement, un nouvel utilisateur vient d'être banni !")
                .addFields([
                { name: `Utilisateur`, value: `${target.user.username}` },
                { name: `Raison`, value: `${reason}` }
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: "Par yatsuuw @ Discord", iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()

        const banDm = new EmbedBuilder()
            .setTitle("Bannissement")
            .setDescription(`Vous venez d'être banni(e) du serveur \`${target.guild.name}\`.`)
            .setColor("Red")
            .addFields([
                { name: 'Raison :', value: `${reason}` },
                { name: 'Staff', value: `${interaction.user.username}` }
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: 'Par yatsuuw @ Discord' })
            .setTimestamp()

        try {
            await target.send({ embeds: [banDm] });
            const targetBan = "Y"
            await target.ban({ reason });
            return await interaction.reply({ embeds: [banServer] });
        } catch (error) {
            return await interaction.reply({ content: `Une erreur est survenue lors du bannissement de l'utilisateur !\n${error}`, ephemeral: true });
        }
})
