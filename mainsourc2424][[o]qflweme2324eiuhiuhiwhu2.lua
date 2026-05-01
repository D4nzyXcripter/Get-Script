local WEBHOOK_AUTHORIZED   = "https://discord.com/api/webhooks/1473923644160872572/E6JF9jNgwi5kT9hTjO-byEX7uA4nPMZor2MaVebaofGxfoK7obJkFko58inH41qw_YDJ"
local WEBHOOK_UNAUTHORIZED = "https://discord.com/api/webhooks/1473923644861452411/d8acDE9a5d8tqBQ4kodUFInmJ0KQiQ895v4qXpaNLgLB-1rMvLYQRm0K0FDmXpZdjTV5"

local function T(input)
    local now = os.time()
    if type(input) == "string" then
        local val, unit = input:match("^(%d+)([smhd])$")
        val = tonumber(val)
        if not val or not unit then
            error("Format salah! Gunakan: '1s', '2m', '3h', '4d'")
        end
        local multiplier = { s=1, m=60, h=3600, d=86400 }
        return now + val * multiplier[unit]
    elseif type(input) == "number" then
        return input
    else
        error("T() hanya menerima string seperti '1d', '2h', dll.")
    end
end

-- ================================================
--        AUTHORIZED USERS
-- limit mode : { type="limit", value=N }   -- N kali pakai, -1 = unlimited
-- time mode  : { type="time", expire=T("1d") } -- durasi dari sekarang
-- ================================================
local authorizedUsers = {
--  ["kevinalwaysmeta"]       = { type="time", duration=T("60s") },
    ["ziolez82636"]          = { type="time", duration=T("1h") },
    ["kevinalwaysmeta"]      = { type="limit", value=-1 },
    ["StarBoyTulus"]         = { type="limit", value=-1 },
    ["Darbit60"]             = { type="limit", value=-1 },
    ["d4nzySuper"]           = { type="limit", value=-1 },
    ["dontol5012"]           = { type="limit", value=-1 },
    ["sukinoo7"]             = { type="limit", value=-1 },
    ["Beno12_44agung"]       = { type="limit", value=-1 },
    ["rlueeeeg7"]            = { type="limit", value=-1 },
    ["izurinrob4"]           = { type="limit", value=-1 },
    ["arididuri"]            = { type="limit", value=-1 },
    ["tanzilkece"]           = { type="limit", value=-1 },
    ["Tymek_Teo"]            = { type="limit", value=-1 },
    ["lala927nxu"]           = { type="limit", value=-1 },
    ["Stars5909"]            = { type="limit", value=-1 },
    ["dapol44"]              = { type="limit", value=-1 },
    ["kaku123794"]           = { type="limit", value=-1 },
    ["nachzuchtlk"]          = { type="limit", value=-1 },
    ["alip_0404"]            = { type="limit", value=-1 },
    ["HAKIMNOT5"]            = { type="limit", value=-1 },
    ["esavage74"]            = { type="limit", value=-1 },
    ["SINZx444X"]            = { type="limit", value=-1 },
    ["starbell913"]          = { type="limit", value=-1 },
    ["egozuper15"]           = { type="limit", value=-1 },
    ["boralobobby1545xd371"] = { type="limit", value=-1 },
    ["d4nzy_nzy"]            = { type="limit", value=-1 },
    ["erlan125717"]          = { type="limit", value=-1 },
    ["odol_62726"]           = { type="limit", value=-1 },
    ["Berkas13alvi"]         = { type="limit", value=-1 },
    ["kskaks365"]            = { type="limit", value=-1 },
    ["tayei017"]             = { type="limit", value=-1 },
    ["Lynore82"]             = { type="limit", value=-1 },
    ["naufal124006"]         = { type="limit", value=-1 },
    ["666_VIBESDEVIL"]       = { type="limit", value=-1 },
    ["syaxc3"]               = { type="limit", value=-1 },
    ["kelvin_ganteng706"]    = { type="limit", value=-1 },
    ["fursicfus"]            = { type="limit", value=-1 },
}

local MAX_FORCE_ATTEMPTS = 5
local BAN_KICK_THRESHOLD = 3

local HttpService = game:GetService("HttpService")
local Players     = game:GetService("Players")
local StarterGui  = game:GetService("StarterGui")
local player      = Players.LocalPlayer

local function fname(tag, key)
    return tag .. "_" .. key:lower() .. ".txt"
end

local function readInt(file, default)
    if isfile(file) then
        return tonumber(readfile(file)) or default
    end
    return default
end

local function writeInt(file, val)
    writefile(file, tostring(val))
end

local function showNotif(title, text, duration)
    pcall(function()
        StarterGui:SetCore("SendNotification", {
            Title    = title,
            Text     = text,
            Duration = duration or 5,
        })
    end)
end

local function getTimestamp()
    return os.date("!%Y-%m-%dT%H:%M:%SZ")
end

-- ================================================
--        WEBHOOK (MULTI-EXECUTOR SUPPORT)
-- ================================================
local function httpRequest(data)
    if syn and syn.request then
        return syn.request(data)
    elseif http and http.request then
        return http.request(data)
    elseif http_request then
        return http_request(data)
    elseif request then
        return request(data)
    else
        warn("❌ Tidak ada HTTP function yang tersedia di executor ini.")
    end
end

local function sendWebhook(url, embed)
    pcall(function()
        local body = HttpService:JSONEncode({ embeds = { embed } })
        httpRequest({
            Url     = url,
            Method  = "POST",
            Headers = { ["Content-Type"] = "application/json" },
            Body    = body,
        })
    end)
end

local function buildPlaceInfo()
    local id   = tostring(game.PlaceId)
    local link = "https://www.roblox.com/games/" .. id
    return id, link
end

local function getEntry(name)
    local lower = name:lower()
    for key, val in pairs(authorizedUsers) do
        if key:lower() == lower then
            return key, val
        end
    end
    return nil, nil
end

local function kickPlayer(reason)
    player:Kick(reason)
end

local function formatTimeLeft(seconds)
    if seconds <= 0 then return "0s" end
    local d = math.floor(seconds / 86400)
    local h = math.floor((seconds % 86400) / 3600)
    local m = math.floor((seconds % 3600) / 60)
    local s = seconds % 60
    local parts = {}
    if d > 0 then table.insert(parts, d .. "d") end
    if h > 0 then table.insert(parts, h .. "h") end
    if m > 0 then table.insert(parts, m .. "m") end
    if s > 0 then table.insert(parts, s .. "s") end
    return table.concat(parts, " ")
end

local playerName         = player.Name
local authKey, authData  = getEntry(playerName)
local placeId, placeLink = buildPlaceInfo()

local blacklistFile = fname("blacklist", playerName)
if isfile(blacklistFile) then
    local forceFile = fname("force", playerName)
    local attempts  = readInt(forceFile, 0) + 1
    writeInt(forceFile, attempts)

    sendWebhook(WEBHOOK_UNAUTHORIZED, {
        title       = "🚷  BLACKLISTED USER ATTEMPT",
        description = "User **BLACKLIST** mencoba execute script!",
        color       = 10038562,
        fields      = {
            { name = "👤  User",          value = "`" .. playerName .. "`", inline = true  },
            { name = "🔴  Status",        value = "**BLACKLISTED**",         inline = true  },
            { name = "🔁  Force Attempt", value = tostring(attempts) .. "x", inline = false },
            { name = "🎮  Place ID",      value = "`" .. placeId .. "`",     inline = false },
            { name = "🔗  Place Link",    value = placeLink,                 inline = false },
        },
        footer    = { text = "Script Monitor • Blacklisted" },
        timestamp = getTimestamp(),
    })
    showNotif("🚷 BLACKLISTED", "Kamu telah di-blacklist selamanya.", 10)
    warn("🚷 You are BLACKLISTED.")
    kickPlayer("🚷 Kamu di-blacklist permanen dari script ini.")
    return
end

if not authKey then
    local forceFile = fname("force", playerName)
    local attempts  = readInt(forceFile, 0) + 1
    writeInt(forceFile, attempts)
    local kickCount = readInt(fname("kicks", playerName), 0)

    sendWebhook(WEBHOOK_UNAUTHORIZED, {
        title       = "⛔  UNAUTHORIZED EXECUTE",
        description = "User **tidak terdaftar** mencoba menjalankan script!",
        color       = 15158332,
        fields      = {
            { name = "👤  User",          value = "`" .. playerName .. "`", inline = true  },
            { name = "🔴  Status",        value = "**UNAUTHORIZED**",        inline = true  },
            { name = "🔁  Force Attempt", value = tostring(attempts) .. "x", inline = false },
            { name = "🎮  Place ID",      value = "`" .. placeId .. "`",     inline = false },
            { name = "🔗  Place Link",    value = placeLink,                 inline = false },
        },
        footer    = { text = "Script Monitor • Unauthorized" },
        timestamp = getTimestamp(),
    })
    showNotif("⛔ Access Denied", "Kamu tidak punya akses.", 6)
    warn("⛔ You Don't Have Access.")

    if attempts >= MAX_FORCE_ATTEMPTS then
        local newKicks = kickCount + 1
        writeInt(fname("kicks", playerName), newKicks)
        writeInt(forceFile, 0)

        if newKicks >= BAN_KICK_THRESHOLD then
            writefile(blacklistFile, "1")
            sendWebhook(WEBHOOK_UNAUTHORIZED, {
                title       = "🚷  USER DI-BLACKLIST",
                description = "Terlalu banyak force execute → BLACKLIST PERMANEN",
                color       = 10038562,
                fields      = {
                    { name = "👤  User",   value = "`" .. playerName .. "`", inline = true  },
                    { name = "🔴  Status", value = "**BLACKLISTED**",         inline = true  },
                    { name = "🎮  Place",  value = placeLink,                 inline = false },
                },
                footer    = { text = "Script Monitor • Auto Blacklist" },
                timestamp = getTimestamp(),
            })
            showNotif("🚷 Blacklisted!", "BLACKLIST PERMANEN", 8)
            kickPlayer("🚷 Blacklist Permanen — terlalu banyak force execute!")
        else
            local cooldowns = { "⚠️ Peringatan 1/3 — Hati-hati!", "⚠️ Peringatan 2/3 — Terakhir!" }
            local msg = cooldowns[newKicks] or "⚠️ Peringatan!"
            showNotif("🥾 Kicked!", msg, 8)
            kickPlayer("🥾 " .. msg)
        end
    end
    return
end

if authData.type == "time" then
    local now           = os.time()
    local remainFile    = fname("remain", authKey)
    local lastExecFile  = fname("lastexec", authKey)

    -- Ambil sisa durasi
    local remaining
    if isfile(remainFile) then
        remaining = tonumber(readfile(remainFile))
    else
        remaining = authData.duration - now
        writefile(remainFile, tostring(remaining))
    end

    if remaining <= 0 then
        local forceFile = fname("force", authKey)
        local attempts  = readInt(forceFile, 0) + 1
        writeInt(forceFile, attempts)
        local kickCount = readInt(fname("kicks", authKey), 0)

        sendWebhook(WEBHOOK_UNAUTHORIZED, {
            title       = "⏰  TIME LIMIT HABIS",
            description = "User terdaftar tapi **waktu akses sudah habis**!",
            color       = 15105570,
            fields      = {
                { name = "👤  User",          value = "`" .. authKey .. "`",  inline = true  },
                { name = "🔴  Status",        value = "**EXPIRED**",           inline = true  },
                { name = "🔁  Force Attempt", value = tostring(attempts) .. "x", inline = false },
                { name = "🎮  Place ID",      value = "`" .. placeId .. "`",  inline = false },
                { name = "🔗  Place Link",    value = placeLink,              inline = false },
            },
            footer    = { text = "Script Monitor • Time Expired" },
            timestamp = getTimestamp(),
        })
        showNotif("⏰ Akses Expired", "Waktu akses kamu sudah habis!", 6)
        warn("⏰ Your time access has expired.")

        if attempts >= MAX_FORCE_ATTEMPTS then
            local newKicks = kickCount + 1
            writeInt(fname("kicks", authKey), newKicks)
            writeInt(forceFile, 0)

            if newKicks >= BAN_KICK_THRESHOLD then
                writefile(fname("blacklist", authKey), "1")
                sendWebhook(WEBHOOK_UNAUTHORIZED, {
                    title       = "🚷  USER DI-BLACKLIST (TIME EXPIRED)",
                    description = "Force execute berkali-kali setelah expire → BLACKLIST",
                    color       = 10038562,
                    fields      = {
                        { name = "👤  User",  value = "`" .. authKey .. "`", inline = true  },
                        { name = "🎮  Place", value = placeLink,             inline = false },
                    },
                    footer    = { text = "Script Monitor • Auto Blacklist" },
                    timestamp = getTimestamp(),
                })
                kickPlayer("🚷 Blacklist Permanen — terlalu banyak force execute!")
            else
                local cooldowns = { "⚠️ Peringatan 1/3", "⚠️ Peringatan 2/3" }
                local msg = cooldowns[newKicks] or "⚠️ Peringatan!"
                showNotif("🥾 Kicked!", msg, 8)
                kickPlayer("🥾 " .. msg)
            end
        end
        return
    end

    writefile(lastExecFile, tostring(now))

    local sessionStart = now
    task.spawn(function()
        while true do
            task.wait(1)
            local elapsed   = os.time() - sessionStart
            local newRemain = remaining - elapsed
            if newRemain < 0 then newRemain = 0 end
            writefile(remainFile, tostring(math.floor(newRemain)))
            if newRemain <= 0 then
                showNotif("⏰ Waktu Habis!", "Sesi kamu telah berakhir.", 8)
                warn("⏰ Time's up!")
                kickPlayer("⏰ Waktu akses habis.")
                break
            end
        end
    end)

    sendWebhook(WEBHOOK_AUTHORIZED, {
        title       = "✅  SCRIPT EXECUTED (TIME)",
        description = "User authorized (time-based) berhasil execute.",
        color       = 3066993,
        fields      = {
            { name = "👤  User",       value = "`" .. authKey .. "`", inline = true  },
            { name = "🟢  Status",     value = "**AUTHORIZED**",       inline = true  },
            { name = "⏳  Sisa Waktu", value = formatTimeLeft(math.floor(remaining)), inline = false },
            { name = "🎮  Place ID",   value = "`" .. placeId .. "`",  inline = false },
            { name = "🔗  Place Link", value = placeLink,              inline = false },
        },
        footer    = { text = "Script Monitor • Authorized (Time)" },
        timestamp = getTimestamp(),
    })
    showNotif("✅ Script Loaded", "Sisa waktu: " .. formatTimeLeft(math.floor(remaining)), 5)

elseif authData.type == "limit" then
    local maxUsage     = authData.value
    local usageFile    = fname("usage", authKey)
    local currentUsage = readInt(usageFile, 0)

    if maxUsage ~= -1 and currentUsage >= maxUsage then
        local forceFile = fname("force", authKey)
        local attempts  = readInt(forceFile, 0) + 1
        writeInt(forceFile, attempts)
        local kickCount = readInt(fname("kicks", authKey), 0)

        sendWebhook(WEBHOOK_UNAUTHORIZED, {
            title       = "🚫  LIMIT HABIS — EXECUTE DITOLAK",
            description = "User terdaftar tapi **limit sudah habis**!",
            color       = 15105570,
            fields      = {
                { name = "👤  User",          value = "`" .. authKey .. "`",                                      inline = true  },
                { name = "🔴  Status",        value = "**INACTIVE** *(Limit Habis)*",                             inline = true  },
                { name = "📊  Usage",         value = tostring(maxUsage) .. "x / " .. tostring(maxUsage) .. "x",  inline = false },
                { name = "🔁  Force Attempt", value = tostring(attempts) .. "x",                                  inline = false },
                { name = "🎮  Place ID",      value = "`" .. placeId .. "`",                                      inline = false },
                { name = "🔗  Place Link",    value = placeLink,                                                  inline = false },
            },
            footer    = { text = "Script Monitor • Limit Reached" },
            timestamp = getTimestamp(),
        })
        showNotif("⛔ Limit Reached", "Limit kamu sudah habis! (" .. maxUsage .. "x)", 6)
        warn("⛔ Usage limit reached (" .. maxUsage .. "x).")

        if attempts >= MAX_FORCE_ATTEMPTS then
            local newKicks = kickCount + 1
            writeInt(fname("kicks", authKey), newKicks)
            writeInt(forceFile, 0)

            if newKicks >= BAN_KICK_THRESHOLD then
                writefile(fname("blacklist", authKey), "1")
                sendWebhook(WEBHOOK_UNAUTHORIZED, {
                    title       = "🚷  USER DI-BLACKLIST (LIMIT HABIS)",
                    description = "Force execute berkali-kali setelah limit habis → BLACKLIST",
                    color       = 10038562,
                    fields      = {
                        { name = "👤  User",  value = "`" .. authKey .. "`", inline = true  },
                        { name = "🎮  Place", value = placeLink,             inline = false },
                    },
                    footer    = { text = "Script Monitor • Auto Blacklist" },
                    timestamp = getTimestamp(),
                })
                kickPlayer("🚷 Blacklist Permanen — terlalu banyak force execute!")
            else
                local cooldowns = { "⚠️ Peringatan 1/3", "⚠️ Peringatan 2/3" }
                local msg = cooldowns[newKicks] or "⚠️ Peringatan!"
                showNotif("🥾 Kicked!", msg, 8)
                kickPlayer("🥾 " .. msg)
            end
        end
        return
    end

    if maxUsage ~= -1 then
        writeInt(usageFile, currentUsage + 1)
    end
    writeInt(fname("force", authKey), 0)

    local used    = (maxUsage ~= -1) and (currentUsage + 1) or currentUsage
    local leftStr = (maxUsage ~= -1) and tostring(maxUsage - used) or "INF"

    sendWebhook(WEBHOOK_AUTHORIZED, {
        title       = "✅  SCRIPT EXECUTED",
        description = "User authorized berhasil menjalankan script.",
        color       = 3066993,
        fields      = {
            { name = "👤  User",       value = "`" .. authKey .. "`",                                    inline = true  },
            { name = "🟢  Status",     value = "**AUTHORIZED**",                                          inline = true  },
            { name = "📊  Usage",      value = tostring(used) .. "x dipakai | **" .. leftStr .. "** sisa", inline = false },
            { name = "🎮  Place ID",   value = "`" .. placeId .. "`",                                     inline = false },
            { name = "🔗  Place Link", value = placeLink,                                                 inline = false },
        },
        footer    = { text = "Script Monitor • Authorized" },
        timestamp = getTimestamp(),
    })
    showNotif("✅ Script Loaded", "LIMIT DIPAKAI " .. used .. "x | " .. leftStr .. " tersisa", 5)
end

local success1, err1 = pcall(function()
    -- local url = "https://raw.githubusercontent.com/D4nzyXcripter/Get-Script/refs/heads/main/gg.lua"
    local url = "https://raw.githubusercontent.com/D4nzyXcripter/Get-Script/refs/heads/main/aa.lus"
    local content = game:HttpGet(url, true) -- tambah true untuk bypass cache
    if not content or content == "" then
        error("HttpGet return kosong / gagal fetch")
    end
    local fn, loadErr = loadstring(content)
    if not fn then
        error("loadstring gagal: " .. tostring(loadErr))
    end
    fn()
end)
if not success1 then
    warn("⚠️ Script 1 gagal: " .. tostring(err1))
    showNotif("⚠️ Error", "Script 1 gagal: " .. tostring(err1):sub(1, 50), 8)
end

local success2, err2 = pcall(function()
    loadstring(game:HttpGet("https://pastebin.com/raw/SZQYx8gK"))()
end)
if not success2 then
    warn("⚠️ Script 2 gagal: " .. tostring(err2))
    showNotif("⚠️ Error", "Script 2 gagal diload.", 5)
end
