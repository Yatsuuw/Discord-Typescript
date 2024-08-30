import commands from '../../commands';
import { Command } from '../../types';
import { event } from '../../utils';
import { handleButtonInteraction } from '../handleButtonInteraction';

const allCommands = commands.map(({ commands }) => commands).flat();
const allCommandsMap = new Map<string, Command>(
    allCommands.map((c: Command) => [c.meta.name, c])
);

export default event('interactionCreate', async ({ log, client }, interaction) => {
    if (interaction.isChatInputCommand()) {
        try {
            const commandName = interaction.commandName;
            const command = allCommandsMap.get(commandName);

            if (!command) throw new Error('Command not found...');

            await command.exec({
                client,
                interaction,
                log(...args) {
                    log(`[${command.meta.name}]`, ...args);
                },
            });
        } catch (error) {
            log('[Command Error]', error);

            if (interaction.deferred)
                return interaction.editReply({
                    content: 'Something went wrong :('
                });

            return interaction.reply({
                content: 'Something went wrong :(',
                ephemeral: true
            });
        }
    } else if (interaction.isButton()) {
        await handleButtonInteraction(interaction, log);
    }
});
