/**
 * XtonCore — Ready Event Example
 * 
 * This event fires once when the bot successfully logs in.
 * Place this file in: events/ready/01-startup.ts
 * 
 * The folder name ("ready") determines which Discord event this handles.
 * The file number prefix ("01-") controls execution order.
 */

import { Client } from 'discord.js';

export default async function (client: Client) {
    console.log(`✅ Logged in as ${client.user?.tag}`);
    console.log(`📡 Serving ${client.guilds.cache.size} guilds`);
    console.log(`👥 ${client.users.cache.size} users cached`);

    // Set bot activity status
    client.user?.setActivity('with XtonCore v2.1', { type: 0 });
}
