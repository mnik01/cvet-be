import { serve } from "https://deno.land/std@0.145.0/http/server.ts";
import "https://deno.land/x/dotenv/load.ts";
import {
    TelegramBot,
    UpdateType,
} from "https://deno.land/x/telegram_bot_api/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "content-type",
}



const TOKEN = Deno.env.get("BOT_TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);

const subscribers: string[] = [];

bot.on(UpdateType.Message, async ({ message }) => {

    console.log(subscribers)
    console.log(message.chat.id)

    if (subscribers.includes(message.chat.id)) {
        bot.sendMessage({
            chat_id: message.chat.id,
            text: 'Вы уже подписаны на получение заявки для распечатки',
        });
    } else {
        subscribers.push(message.chat.id)
        bot.sendMessage({
            chat_id: message.chat.id,
            text: 'Теперь вы будете получать заявки на распечатку',
        });
    }
});

bot.run({
    polling: true,
});


serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    };
    if (req.method === 'POST') {
        // const body = req.body;
        // const blob = await req.blob();

        console.log(3)
        try {
            console.log(2)
            subscribers.forEach(subscriber => {
                console.log(1)
                bot.sendMessage({
                    chat_id: subscriber,
                    text: 'Пришла заявка',
                });
            })

            return new Response(JSON.stringify({}), {
                headers: corsHeaders,
            })
        } catch (error) {
            return new Response(null, { status: 500, statusText: 'Internal server error' })
        }

    }

    return new Response(null)
});
