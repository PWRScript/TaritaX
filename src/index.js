const { ShardingManager } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

let manager = null;

try {
	manager = new ShardingManager('./bot.js', { token: process.env.DISCORD_TOKEN, respawn: true });
}
catch (error) {
	manager = new ShardingManager('./src/bot.js', { token: process.env.DISCORD_TOKEN, respawn: true });
}

manager.on('shardCreate', shard => console.log(`[Shard-Manager] Shard ${shard.id} is up`));

manager.spawn();