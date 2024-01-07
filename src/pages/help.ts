import { ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder } from "@discordjs/builders"
import { APIEmbedField, ButtonStyle, EmbedBuilder, InteractionReplyOptions, StringSelectMenuOptionBuilder } from "discord.js"
import CategoryRoot from '../commands'
import { chunk, createId, readId } from "../utils"

// Namespaces we will use
export const Namespaces = {
    root: 'help_category_root',
    select: 'help_category_select',
    action: 'help_category_action'
}

// Actions we will use
export const Actions = {
    next: '+',
    back: '-'
}

const N = Namespaces
const A = Actions

// Generate root embed for help paginator
export function getCategoryRoot(ephemeral?: boolean): InteractionReplyOptions {
    // Map the categories
    const mappedCategories = CategoryRoot.map(({ name, description, emoji }) => 
        new StringSelectMenuOptionBuilder({
            label: name,
            description,
            emoji,
            value: name,
        })
    )

    // Create embed
    const embed = new EmbedBuilder()
        .setTitle('Menu d\'aide')
        .setDescription('Recherche les informations liées à ta demande.')
        .setColor("Aqua")

    // Create select menu for categories
    const selectId = createId(N.select)
    const select = new StringSelectMenuBuilder()
        .setCustomId(selectId)
        .setPlaceholder('Catégories des commandes')
        .setMaxValues(1)
        .setOptions(mappedCategories)

    const component = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(select)

    return {
        embeds: [embed],
        components: [component],
        ephemeral,
    }
}

// Generate new embed for current category page
export function getCategoryPage(interactionId: string): InteractionReplyOptions {
    // Extractly needed metadata from interactionId
    const [_namespace, categoryName, action, currentOffset] = readId(interactionId)

    const categoryChunks = CategoryRoot.map((c) => {
        // Pre-map all commands as embed fields
        const commands: APIEmbedField[] = c.commands.map((c) => ({
            name: c.meta.name,
            value: c.meta.description,
        }))

        return {
            ...c,
            commands: chunk(commands, 10),
        }
    })

    const category = categoryChunks.find(({ name }) => name === categoryName)
    if (!category)
        throw new Error('interactionId invalide ; La page de la catégorie correspondante n\'a pas été trouvée !')

        // Get current offset
        let offset = parseInt(currentOffset)
        // if is NaN set offset to 0
        if (isNaN(offset)) offset = 0
        // Increment offset according to action
        if (action === A.next) offset++
        else if (action === A.back) offset--

        const emoji = category.emoji ? `${category.emoji} ` : ''
        const defaultDescription = `J'ai trouvé ${category.commands.flat().length} commandes dans la catégorie ${emoji}${category.name}`

        const embed = new EmbedBuilder()
            .setTitle(`Commandes | ${emoji}${category.name}`)
            .setDescription(category.description ?? defaultDescription)
            .setColor("Aqua")
            .setFields(category.commands[offset])
            .setFooter({ text: `${offset + 1} / ${category.commands.length}` })

        // Back button
        const backId = createId(N.action, category.name, A.back, offset)
        const backButton = new ButtonBuilder()
            .setCustomId(backId)
            .setLabel('Retour')
            .setStyle(ButtonStyle.Danger)
            .setDisabled(offset <= 0)

        // Return to root
        const rootId = createId(N.root)
        const rootButton = new ButtonBuilder()
            .setCustomId(rootId)
            .setLabel('Catégories')
            .setStyle(ButtonStyle.Secondary)

        // Next button
        const nextId = createId(N.action, category.name, A.next, offset)
        const nextButton = new ButtonBuilder()
            .setCustomId(nextId)
            .setLabel('Suivant')
            .setStyle(ButtonStyle.Success)
            .setDisabled(offset >= category.commands.length - 1)

        const component = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(backButton, rootButton, nextButton)

        return {
            embeds: [embed],
            components: [component]
        }
}
