import { GuildMember, SlashCommandBuilder, Collection, Message, TextChannel, EmbedBuilder, PermissionFlagsBits } from 'discord.js'
import { command } from '../../utils'

const meta = new SlashCommandBuilder ()
    .setName('clear')
    .setDescription('Supprimer un nombre de messages déterminé')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addChannelOption((option) => 
        option
            .setName('channel')
            .setDescription('Salon où les messages seront supprimés')
            .setRequired(true)
    )
    .addIntegerOption((option) => 
        option
            .setName('number')
            .setDescription('Nombre de messages à supprimer')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
    )
    .addUserOption((option) =>
        option
            .setName('target')
            .setDescription('Utilisateur qui verra ses messages être supprimés')
            .setRequired(false)
    )

export default command(meta, ({ interaction }) => async() => {
        let amount = interaction.options.getInteger("amout")!;
        const channel = (interaction.options.getChannel("channel") || interaction.channel) as TextChannel;
        const target = interaction.options.getMember("target") as GuildMember;

        if (amount < 1 || amount > 100)
            return interaction.reply("Vous ne pouvez pas renseigner un nombre inférieur à 1 ou supérieur à 100.");

        const messages: Collection<string, Message<true>> = await channel.messages.fetch();

        var filterMessages = target ? messages.filter(m => m.author.id === target.id) : messages;
        let deleted = 0

        try {
            deleted = (await channel.bulkDelete(Array.from(filterMessages.keys()).slice(0, amount), true)).size;
        } catch (error) {
            return interaction.reply({ content: `Une erreur s'est produite lors de la suppression des messages !\n${error}`, ephemeral: true });
        }

        interaction.reply({ embeds: [new EmbedBuilder()
            .setColor("Orange")
            .setDescription(`**Deleted** \`${deleted}\` messages ${target ? `from ${target}` : ""} in ${channel}.`)
        ], ephemeral: true });
})
