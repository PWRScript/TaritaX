const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder().setName('music').setDescription('All music commands related to TaritaX')
		.addSubcommand(option => option.setName('play')
			.setDescription('Plays the specified music in a voice channel').addStringOption(option2 => option2.setName('query').setDescription('Search term or link of music')
				.setRequired(true))),

	guild_only: true,

	async execute(interaction) {


		if (interaction.options.getSubcommand() === 'play') {
			// Get channel id
			let channel_vc_id = null;


			channel_vc_id = interaction.member.voice.channelId;
			if (channel_vc_id == null) {

				const j_vc_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
					'**You must join a voice channel first to use this command**',
				).setTitle('❌ Member Context Error').setFooter('Executed by ' + interaction.member.user.tag, interaction.member.user.displayAvatarURL(),
				);

				return interaction.reply(
					{ embeds:  [j_vc_embed] },
				);
			}


		}

	},

};