const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const humanizeDuration = require('humanize-duration');

module.exports = {
	data: new ContextMenuCommandBuilder().setName('Add Music to Queue').setType(3),
	guild_only: true,

	async execute(interaction) {
		await interaction.deferReply();
		// Get channel id
		let channel_vc_id = null;


		channel_vc_id = interaction.member.voice.channelId;
		if (channel_vc_id == null) {

			const j_vc_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
				'**You must join a voice channel first to use this command**',
			).setTitle('❌ Member Context Error').setFooter('Executed by ' + interaction.member.user.tag, interaction.member.user.displayAvatarURL(),
			);

			return interaction.editReply(
				{ embeds:  [j_vc_embed] },
			);
		}


		let res = null;
		const link = interaction.options.data[0].message.content;
		if (link === '') {

			const err_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
				'**Please specify a valid message with a link or a search query!**',
			).setTitle('❌ Music Loading Failed').setFooter('Executed by ' + interaction.member.user.tag, interaction.member.user.displayAvatarURL(),
			);
			return interaction.editReply({ embeds:[err_embed] });
		}
		try {
			// Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
			res = await interaction.client.lavalink.search(link, interaction.user);
			// Check the load type as this command is not that advanced for basics
			if (res.loadType === 'LOAD_FAILED') {throw res.exception;}
			else if (res.loadType === 'PLAYLIST_LOADED') {
				let data = [];

				const player = interaction.client.lavalink.create({
					guild: interaction.guild.id,
					voiceChannel: interaction.member.voice.channel.id,
					textChannel: interaction.channel.id,
				});

				player.connect();
				let cont = 0;
				res.tracks.forEach(track => {

					let dura = null;

					if (track.isStream) {
						dura = 'Livestream';
					}
					else {
						dura = humanizeDuration(track.duration);
					}

					data.push(new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
						'**Title: **``' + track.title + '``\n**Uploaded by: **``' + track.author + '``\n**Duration: **``' + dura + '``',
					).setTitle('⌛ Added to Queue').setFooter('Requested by ' + track.requester.tag, track.requester.displayAvatarURL(),
					).setURL(track.uri).setImage(track.thumbnail));

					player.queue.add(track);


					cont++;
					if (cont == 1 && !player.playing && !player.paused && !player.queue.size) {player.play();}
					else if (cont % 10 == 0) {

						interaction.followUp({ embeds:data });
						data = [];

					}

				});
				return interaction.followUp({ embeds:data });

			}
		}
		catch (err) {
			const err_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
				'**Something went wrong when we tried to load the music:**\n```' + err.message + '```',
			).setTitle('❌ Music Loading Failed').setFooter('Executed by ' + interaction.member.user.tag, interaction.member.user.displayAvatarURL(),
			);
			return interaction.editReply({ embeds:[err_embed] });
		}

		if (res.loadType === 'NO_MATCHES') {
			const err_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
				'**Unfortunately we couldn\'t found any music related to ``' + link + '``**',
			).setTitle('❌ Music Not Found').setFooter('Executed by ' + interaction.member.user.tag, interaction.member.user.displayAvatarURL(),
			);
			return interaction.editReply({ embeds:[err_embed] });
		}
		const player = interaction.client.lavalink.create({
			guild: interaction.guild.id,
			voiceChannel: interaction.member.voice.channel.id,
			textChannel: interaction.channel.id,
		});
		const track = res.tracks[0];
		// Connect to the voice channel and add the track to the queue
		if (player.state !== 'CONNECTED') player.connect();
		player.queue.add(track);


		// Checks if the client should play the track if it's the first one added
		if (!player.playing && !player.paused && !player.queue.size) player.play();

		let dur = null;

		if (track.isStream) {
			dur = 'Livestream';
		}
		else {
			dur = humanizeDuration(track.duration);
		}

		const p_embed = new MessageEmbed().setColor('#991550').setTimestamp(Date.now()).setDescription(
			'**Title: **``' + track.title + '``\n**Uploaded by: **``' + track.author + '``\n**Duration: **``' + dur + '``',
		).setTitle('⌛ Added to Queue').setFooter('Requested by ' + track.requester.tag, track.requester.displayAvatarURL(),
		).setURL(track.uri).setImage(track.displayThumbnail());


		return interaction.editReply({ embeds:[p_embed] });
	},

};