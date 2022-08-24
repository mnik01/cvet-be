import { serve } from "https://deno.land/std@0.145.0/http/server.ts";
import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import {
    TelegramBot,
    UpdateType,
} from "https://deno.land/x/telegram_bot_api@0.4.0/mod.ts";
import {readerFromStreamReader} from "https://deno.land/std/io/mod.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST",
    "Access-Control-Allow-Headers": "content-type",
}

const TOKEN = Deno.env.get("BOT_TOKEN");
if (!TOKEN) throw new Error("Bot token is not provided");
const bot = new TelegramBot(TOKEN);

const subscribers: number[] = [];

bot.on(UpdateType.Message, async ({ message }) => {
  const { id } = message.chat;

  if (subscribers.includes(id)) {
      await bot.sendMessage({
          chat_id: id,
          text: 'Вы уже подписаны на получение заявки для распечатки',
      });
  } else {
      subscribers.push(id)
      await bot.sendMessage({
          chat_id: id,
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
    }
    if (req.method === 'POST') {
        const f = await req.formData()

        for (const v of f.entries())
            console.log(v);

        try {
            for (const subscriber of subscribers) {
              await bot.sendDocument({
                chat_id: subscriber,
                document: new File(['blob'], 'name.png'),
                thumb: "attach://file",
                caption: 'Пришла заявка',
                // attachments: {
                //   file: blob,
                // },
              });
            }

            return new Response(null, {
                headers: corsHeaders,
                status: 200,
            })
        } catch {
            return new Response(null, { status: 500, statusText: 'Internal server error' })
        }

    }

    return new Response(null, {status: 404, statusText: 'No such method'})
});
