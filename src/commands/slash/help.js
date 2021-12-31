const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('help').setDescription('Shows all available commands of TaritaX'),

	guild_only: false,

	async execute(interaction) {

		const jy_vc_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
			'**Wait some time until this command has been implemented by bot developers**',
		).setTitle(':warning: Internal Bot Error').setFooter('Executed by ' + interaction.member.user.tag, interaction.member.user.displayAvatarURL(),
		);

		return interaction.reply(
			{ embeds:  [jy_vc_embed] },
		);


	},

};