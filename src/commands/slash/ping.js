const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Checks and returns the ping to discord'),

	guild_only: false,

	async execute(interaction) {

		const j_vc_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
			'**:robot:Bot** and **:file_cabinet:Discord** have a latency of  ``' + interaction.client.ws.ping + ' ms``',
		).setTitle('Bot Connectivity Status').setFooter('Executed by ' + interaction.user.tag, interaction.user.displayAvatarURL(),
		);

		return interaction.reply(
			{ embeds:  [j_vc_embed] },
		);


	},

};