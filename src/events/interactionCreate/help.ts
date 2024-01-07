import { getCategoryPage, getCategoryRoot, Namespaces } from '../../pages/help'
import { createId, EditReply, event, readId, Reply } from '../../utils'
import { StringSelectMenuInteraction } from 'discord.js'

export default event('interactionCreate', async (
    {
        log,
    },
    interaction,
) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return
    const [namespace] = readId(interaction.customId)

    // If namespace not in help pages stop
    if (!Object.values(Namespaces).includes(namespace)) return

    try {
        // Defer update 
        await interaction.deferUpdate()

        switch(namespace) {
            case Namespaces.root:
                return await interaction.editReply(getCategoryRoot())
            case Namespaces.select:
                const newId = createId(
                    Namespaces.select,
                    (interaction as StringSelectMenuInteraction).values[0]
                )
                return await interaction.editReply(getCategoryPage(newId))
            case Namespaces.action:
                return await interaction.editReply(getCategoryPage(interaction.customId))

            default: 
                throw new Error('Espace de noms invalide atteint...')
        }

    } catch (error) {
        log('[Help Erreur]', error)

        if (interaction.deferred)
            return interaction.editReply(
                EditReply.error('Quelque chose n\'a pas fonctionné :(')
            )

        return interaction.reply(
            Reply.error('Quelque chose n\'a pas fonctionné :(')
        )
    }
})
