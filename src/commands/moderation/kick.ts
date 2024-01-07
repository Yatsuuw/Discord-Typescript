import { EmbedBuilder, GuildMember, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('kick')
    .setDescription('Kick un utilisateur')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) => 
        option
            .setName('target')
            .setDescription('Utilisateur à kick')
            .setRequired(true)
    )
    .addStringOption((option) => 
        option
            .setName('reason')
            .setDescription('Raison du kick')
            .setRequired(false)
    )

export default command(meta, async ({ interaction }) => {
        const target = interaction.options.getMember('target') as GuildMember;
        const reason = interaction.options.getString('reason') || 'No reason.';

        if (!target.kickable) return await interaction.reply({ content: 'Ce membre ne peut pas être expulsé.', ephemeral: true });
        
        //if (!target.kickable) console.log(`${target.user.username} ne peut pas être expulsé`);
        //if (target.kickable) console.log(`${target.user.username} a été expulsé`)

        const kickServer = new EmbedBuilder()
            .setTitle("Expulsion")
            .setColor("Red")
            .setDescription("Malheureusement, un nouvel utilisateur vient d'être expulsé !")
                .addFields([
                { name: `Utilisateur`, value: `${target.user.username}` },
                { name: `Raison`, value: `${reason}` }
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: "Par yatsuuw @ Discord", iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp()

        const kickDm = new EmbedBuilder()
            .setTitle("Expulsion")
            .setDescription(`Vous venez d'être expulsé(e) du serveur \`${target.guild.name}\`.`)
            .setColor("Red")
            .addFields([
                { name: 'Raison :', value: `${reason}` },
                { name: 'Staff', value: `${interaction.user.username}` }
            ])
            .setImage(target.displayAvatarURL())
            .setFooter({ text: 'Par yatsuuw @ Discord' })
            .setTimestamp()

        try {
            await target.send({ embeds: [kickDm] });
            const targetKick = "Y"
            await target.kick(reason)
            await interaction.reply({ embeds: [kickServer] })
        } catch (error) {
            await interaction.reply({ content: `Une erreur s'est produite lors de l'expulsion de l'utilisateur !\n${error}`, ephemeral: true });
        }
        
})