const { Client, Interaction, PermissionFlagsBits, ApplicationCommandOptionType } = require('discord.js');
const path = require('path');
const AutoRole = require(path.resolve(__dirname, '../../models/AutoRole'));
module.exports = {
    name: 'autorole',
    description: 'Autorole related commands.',
    options: [
        {
            name: 'configure',
            description: 'Configure the role to be given to new members.',
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'role',
                    description: 'The role assigned to users when they join this server.',
                    type: ApplicationCommandOptionType.Role,
                    required: true,
                },
            ],
        },
        {
            name: 'disable',
            description: 'Disable autorole in this server.',
            type: ApplicationCommandOptionType.Subcommand,
            permissionsRequired: [PermissionFlagsBits.Administrator],
        },
    ],
    permissionsRequired: [PermissionFlagsBits.Administrator],
    botPermissions: [PermissionFlagsBits.ManageRoles],

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if (!interaction.inGuild()) {
            interaction.reply('You can only run this command inside a server.');
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'configure') {

            const targetRoleId = interaction.options.get('role').value;
            const targetRole = interaction.guild.roles.cache.get(targetRoleId);

            try {
                await interaction.deferReply();

                let autoRole = await AutoRole.findOne({ guildId: interaction.guild.id });

                // check if autoRole exists in the database
                if (autoRole) {
                    if (autoRole.roleId === targetRoleId) {
                        interaction.editReply(`Autorole has already been configured for \`@${targetRole.name}\`. To disable, run \`/autorole disable\`, or change the role by running \`/autorole configure\` again.`);
                        return;
                    } else {
                        autoRole.roleId = targetRoleId;
                        await autoRole.save();
                        interaction.editReply(`Autorole has been updated to \`@${targetRole.name}\`.`);
                        return;
                    }
                } else {
                    autoRole = new AutoRole({
                        guildId: interaction.guild.id,
                        roleId: targetRoleId,
                    });
                    await autoRole.save();
                    interaction.editReply(`Autorole has now been configured to \`@${targetRole.name}\`. To disable, run \`/autorole disable\`.`);
                }
            } catch (error) {
                console.log(`An error occurred with /autorole configure: ${error}`);
            }
        } else if (subcommand === 'disable') {

            try {
                await interaction.deferReply();

                if (!(await AutoRole.exists({ guildId: interaction.guild.id }))) {
                    interaction.editReply('Autorole has not been configured for this server. Use `/autorole configure` to set it up.');
                    return;
                }

                await AutoRole.findOneAndDelete({ guildId: interaction.guild.id });
                interaction.editReply('Autorole has been disabled for this server. Use `/autorole configure` to set it up again.');
            } catch (error) {
                console.log(`An error occurred with /autorole disable: ${error}`);
            }
        }
    },
};