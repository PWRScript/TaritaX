const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

const games = {
	'832013003968348200': 'Checkers In The Park',
	'832012774040141894': 'Chess In The Park',
	'878067389634314250': 'Doodle Crew',
	'814288819477020702': 'Fishington.io',
	'879863686565621790': 'Letter Tile',
	'755827207812677713': 'Poker Night',
	'852509694341283871': 'SpellCast',
	'880218394199220334': 'Watch Together',
	'879863976006127627': 'Word Snacks',
};

module.exports = {
	data: new SlashCommandBuilder().setName('voice').setDescription('All voice commands related to TaritaX')
		.addSubcommand(option => option.setName('activity')
			.setDescription('Starts a activity in a voice channel').addStringOption(option2 => option2.setName('activity').setDescription('Which activity do you want to start?').addChoices(
				[
					['Checkers In The Park', '832013003968348200'],
					['Chess In The Park', '832012774040141894'],
					['Doodle Crew', '878067389634314250'],
					['Fishington.io', '814288819477020702'],
					['Letter Tile', '879863686565621790'],
					['Poker Night', '755827207812677713'],
					['SpellCast', '852509694341283871'],
					['Watch Together', '880218394199220334'],
					['Word Snacks', '879863976006127627'],
				],
			).setRequired(true)).addChannelOption(ch => ch.addChannelType(2).setName('channel').setDescription('Where do you want to start the activity?'))),

	async execute(interaction) {

		// Get channel id
		let channel_vc_id = interaction.options.getChannel('channel');

		if (channel_vc_id != null) {
			channel_vc_id = channel_vc_id.id;
		}
		else {

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

		// Check permissions
		const bot_permissions = interaction.member.voice.channel.permissionsFor(interaction.member.guild.me);
		const p_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
			'**Please ensure that the [View Channel](https://support.discord.com/hc/articles/206029707-Setting-Up-Permissions-FAQ), [Create Invite](https://support.discord.com/hc/articles/206029707-Setting-Up-Permissions-FAQ) and [Start Activity](https://support.discord.com/hc/articles/206029707-Setting-Up-Permissions-FAQ) permissions for this bot are enabled in <#' + channel_vc_id + '> to execute this command**',
		).setTitle('❌ Bot Permissions Error').setURL('https://support.discord.com/hc/articles/206029707-Setting-Up-Permissions-FAQ').setFooter('Executed by ' + interaction.member.user.tag, interaction.member.user.displayAvatarURL());


		if (!bot_permissions.has('CREATE_INSTANT_INVITE') || !bot_permissions.has('CREATE_INSTANT_INVITE') || !bot_permissions.has('CREATE_INSTANT_INVITE')) {

			return interaction.reply(
				{ embeds:  [p_embed] },
			);
		}

		// Start the game
		await fetch(`https://discord.com/api/v8/channels/${channel_vc_id}/invites`, {
			method: 'POST',
			body: JSON.stringify({
				max_age: 86400,
				max_uses: 0,
				target_application_id: interaction.options.getString('activity'),
				target_type: 2,
				temporary: false,
				validate: null,
			}),
			headers: {
				Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
				'Content-Type': 'application/json',
			},
		}).then((res) => res.json())
			.then((invite) => {
				if (invite.error || !invite.code) throw new Error('An error occured while retrieving data !');
				if (Number(invite.code) === 50013) {
					return interaction.reply(
						{ embeds:  [p_embed] },
					);
				}

				const game_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setTitle('Your voice activity is ready!').setURL(`https://discord.com/invite/${invite.code}`)
					.setDescription('**' + games[interaction.options.getString('activity')] + '** on <#' + channel_vc_id + '>**\n[Click here]( https://discord.com/invite/' + invite.code + ' ) to join**')
                ;
				return interaction.reply({ embeds: [game_embed] });
			});


	},

};