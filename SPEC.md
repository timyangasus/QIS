# QIS Prelink 規格

Figma：[QIS_Prelink](https://www.figma.com/design/pejDijDlBnLq4IXmC5ub71/QIS_Prelink)
目標：做成可安裝到手機主畫面的 PWA App。

## 0. 製作原則

- **圖檔原則**：插圖、說明圖**可以用小的 JPG / WebP / PNG**（每張大約 100 KB 以內），以和原稿一致為優先。**不可以用整頁截圖**（一張 3–4 MB）。簡單的圖示和暫代圖用 SVG / CSS 畫。

- **以正式 App 的做法製作**：畫面全部用 HTML/CSS 做，**不使用 Figma 截圖**。
- **背景**：不用圖檔，**一律用實色，不加漸層**。
- **產品圖**：先用 CSS 畫的暫代圖。這個階段重點是看流程，之後再換成正式的產品去背圖。
- **版面**：以 Figma 截圖為視覺參考，量出位置和尺寸後換算成 440 × 956 pt。
- 之後新增的頁面都照這個方式製作。

## 1. 畫布尺寸

| 項目 | 規格 |
|---|---|
| 基準機型 | iPhone 16 Pro Max |
| 邏輯尺寸 | **440 × 956 pt**（CSS 1px = 1pt） |
| 上方安全區（狀態列 + 動態島） | 62 pt |
| 下方安全區（Home 指示條） | 34 pt |
| 可放內容的高度 | 956 − 62 − 34 = 860 pt |
| 方向 | 只支援直式 |

- **不加手機外框、不加圓角**。
- **瀏覽器預覽**：畫布固定 440 × 956，空間不夠時整個畫布等比縮小（`transform: scale`）；在電腦上最大顯示為原尺寸 440 px 寬。
- **安裝成 PWA**：畫面就是手機的實際螢幕大小，不縮放；版面用 flex 排列，會自動適應其他尺寸的 iPhone。

## 2. 狀態列（時間、訊號、電量）

**規則：狀態列底色 = 該頁背景色；白底頁面用黑字，深色頁面用白字。**

| 頁面 | 狀態列底色 | 時間、訊號顏色 |
|---|---|---|
| 深色頁面（例如 1_010、1_020） | `#0b192d` | 白色 |
| 淺色頁面（例如 1_030、1_040、1_050） | `#ffffff` | 黑色 |

**瀏覽器預覽**
- 畫一條模擬的 iOS 狀態列（`#fake-statusbar`）：左邊是目前時間，右邊是訊號、Wi-Fi、電量。**不畫動態島。**
- 高度 = 上方安全區 62 pt；底色就是頁面背景，文字顏色由 `--statusbar-text` 決定（淺色頁面 `#000`、深色頁面 `#fff`）。
- 只是展示用，數值都是假的，只有時間會照電腦的時間更新。

**安裝成 PWA**
- 模擬狀態列自動隱藏，改顯示系統真的狀態列。
- `apple-mobile-web-app-status-bar-style: default`，換頁時把 `theme-color` 改成該頁背景色；系統依底色深淺自動用黑字或白字。
- 內容從系統狀態列下方開始排；上下安全區用 `env(safe-area-inset-top / bottom)`。
- ⚠️ 不同 iOS 版本對換頁時改 `theme-color` 的支援程度可能不同，**需要在 iPhone 實機確認**。

**下方安全區**：34 pt（Home 指示條），預覽時留白，不另外畫。

## 3. 顏色與字級

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#0b192d` | App 背景、theme-color（取自啟動頁主視覺圖的底色） |
| `--card` | `#142d52` | 卡片底色 |
| `--card-pressed` | `#1f4275` | 卡片按下時的顏色 |
| `--accent` | `#3fa2f5` | 卡片標題（藍字） |
| `--text` | `#ffffff` | 主要文字 |
| `--text-sub` | `#c9d1dc` | 次要文字、箭頭 |
| `--icon-circle` | `#0c1a30` | 啟動頁卡片左側的圓形圖示底 |
| `--panel` | `#000c19` | 資訊區塊底色 |
| `--btn` | `#0293f8` | 主要按鈕、勾選框 |
| `--btn-pressed` | `#0279cc` | 主要按鈕按下時 |
| `--btn-disabled` | `#2a4a6e` | 主要按鈕不能按時 |

**淺色頁面**（`theme: 'light'`，例如 1_030）會換掉以下 token：

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#ffffff` | 背景 |
| `--card` | `#c9dcf3` | 型號方塊底色（淺藍） |
| `--card-pressed` | `#aecbee` | 按下時 |
| `--accent` | `#3a8ee6` | 導覽列標題、返回箭頭 |
| `--text` | `#333333` | 型號名稱 |
| `--text-sub` | `#666666` | 次要文字 |
| `--panel` | `transparent` | 資訊區塊不加底色，直接是白底 |
| `--illust-bg` | `#d4e8fb` | 插圖後方的淺藍圓形 |
| `--divider` | `#b5b5b5` | 分隔線 |
| `--pill-text` | `#1d4f91` | 白色膠囊按鈕的文字 |
| `--camera-bg` | `#4a4d52` | 相機畫面暫代底色 |
| `--scan-green` | `#5ec43c` | 掃描框四角、掃描線 |
| `--spinner` | `#6e6e73` | 載入中轉圈圖示 |
| `--brand` | `#006ce1` | 設定指南的品牌藍：標題、Next 按鈕、連結 |
| `--guide-title` | `#55a5f4` | 設定指南導覽列標題 |
| `--guide-ink` | `#0e1329` | 設定指南右上角 ? 圖示 |
| `--guide-desc` | `#828282` | 設定指南說明文字 |
| `--field-label` | `#555555` | 表單欄位標籤 |
| `--field-line` | `#c8c8c8` | 表單欄位底線、密碼強度空格 |
| `--btn-disabled` | `#b9d6f2` | 主要按鈕不能按時 |

淺色頁面的狀態列是白底黑字（見第 2 節）。

所有頁面的背景都是實色 `--bg`，不加漸層和光暈（原設計的地球也拿掉）。

| 用途 | 字級 |
|---|---|
| 導覽列標題 | 17 pt，semibold |
| 啟動頁卡片標題 | 31 pt |
| 系列卡片標題 | 21 pt |
| 系列卡片型號列表 | 16 pt |
| 副標、說明 | 15 pt |
| 文字連結 | 17 pt，加底線 |

## 4. 共用元件

| 元件 | 規格 |
|---|---|
| 導覽列 `.navbar` | 高 44 pt，標題置中，左側 44 × 44 的返回 ‹；淺色頁面標題和按鈕用 `--accent` 藍色 |
| **返回規則** | **除了 1_010 啟動頁，每一頁左上都有 ‹ 返回**（`data-go="back"`）。有 App 內的瀏覽紀錄時退回實際的上一頁；沒有紀錄時（直接開網址、從 DEMO 列跳頁、或剛經過自動跳頁），回到該頁設定的流程上一頁（screen 的 `back` 欄位）。退到 1_010 就停住，不會跳出 App。 |
| 捲動區 `.scroll-body` | 導覽列固定不動，下方內容可以捲動，並延伸到下方安全區底下 |
| 右箭頭 `.chevron` | 22 pt，`--text-sub` 色 |
| 卡片 | `--card` 底色，按下時變成 `--card-pressed` |
| 主要按鈕 `.btn-primary` | 寬滿版、高 62、膠囊形圓角，`--btn` 藍底白字 18 pt |
| 白色膠囊按鈕 `.pill-btn` | 246 × 66，圓角 33，白底加柔和陰影；左側藍色圖示 + `--pill-text` 文字 16 pt |
| 小文字連結 `.text-link-small` | 15 pt，藍色，加底線 |
| 導覽列右側按鈕 `.navbar-btn-right` | 44 × 44，淺色頁面用 `--btn` 藍色（例如 ? 說明） |
| iOS 系統對話框 `.ios-alert` | 模擬 iOS 原生 alert：寬 270、圓角 14、淺灰半透明毛玻璃；標題 17 pt semibold；按鈕列高 44、藍字 `#007aff`；背後整頁蓋一層 20% 黑 |
| 品牌按鈕 `.btn-brand` | 271 × 54，膠囊形，`--brand` 藍底白字 22 pt（設定指南用） |
| 表單欄位 `field()` | 標籤 13 pt 灰色 + 輸入框 16 pt，下方一條底線；文字欄位右邊可加 ⊗ 清除，密碼欄位右邊是 👁 顯示／隱藏 |
| 密碼強度 `.strength` | 4 格（每格 66 × 3）＋文字：Weak 紅 / Fair 橘 / Good 黃 / Strong 綠，輸入時即時更新 |
| 進度條 `.progress` | 寬 306、高 4，灰底，藍色填滿動畫 |
| 載入轉圈 `.ios-spinner` | iOS 樣式 8 支輻條，36 × 36，`--spinner` 灰色，0.8 秒轉一圈 |
| 勾選框 `.checkbox` | 22 × 22，圓角 5；勾選後變 `--btn` 藍底白勾 |
| 產品暫代圖 `.dev-*` | 用 CSS 畫，高 40–62 pt，底部對齊 |

## 5. 頁面

座標單位都是 pt，以 440 × 956 畫布為準。

### 5.1 `1_010` 啟動頁 `opening`
- Figma node：`711:109`
- 主視覺：`assets/opening-hero.webp`（722 × 902，61 KB），各種裝置圖示透過線路連到路由器。
  - 顯示寬度 380 pt，水平置中，底部距離「設定」卡片 16 pt。
  - 圖的底色和 `--bg` 相同，所以跟背景融為一體，看不出圖片邊界。

| 元件 | 位置 (x, y, w, h) | 動作 |
|---|---|---|
| 設定 — 設定新網路（＋ 圖示） | 21, 614, 397, 106 | → `series` 1_020 |
| 管理 — 管理已連接的路由器（登入圖示） | 21, 734, 397, 106 | → `manage`（待提供） |
| 問題回報（左下文字連結） | 14, 862 | → `feedback`（待提供） |
| 帳號登入（右下文字連結） | 右側 14, 862 | → `login`（待提供） |

### 5.2 `1_020` 選擇系列裝置 `series`
- Figma node：`711:111`
- 導覽列：左邊 ‹ 返回（原稿是 ✕，依返回規則改成 ‹），標題「選擇設定裝置」
- 截圖左上角的「◂ App Store」是 iOS 系統的返回連結，不用做。
- Figma 畫面外的綠色箭頭是原型的流程線，不屬於 UI。目前箭頭從 ZenWiFi 拉出，表示主要流程走 ZenWiFi。
- 系列卡片：寬 414、高 169、間距 11，圓角 7；內容依序是藍色標題、型號列表（最多 2 行）、一排產品暫代圖，右側中間有箭頭。

| 元件 | 產品暫代圖 | 動作 |
|---|---|---|
| ‹ 返回 | — | → `opening` 1_010 |
| 華碩無線路由器 | 黑色天線路由器、電競路由器、寬版路由器、電競方塊 | → `series-router`（待提供） |
| 華碩 ZenWiFi 系列 | 4 台白色機種、1 台黑色機種 | → `series-zenwifi` 1_030 |
| 華碩 Lyra 系列 | 圓盤、三角、長條 | → `series-lyra`（待提供） |

### 5.3 `1_030` 選擇 ZenWiFi 裝置 `series-zenwifi`
- Figma node：`711:115`
- **淺色頁面**：白色背景；狀態列白底黑字
- 導覽列：左邊藍色 ‹ 返回（→ `series` 1_020），標題「華碩 ZenWiFi 系列」（藍色）
- 型號方塊：3 欄，方塊大小約 122 × 128，欄距 14、列距 24，圓角 16，淺藍底；上方是產品暫代圖，下方是型號名稱（15 pt）。
- 清單可以捲動。

| 型號 | 暫代圖 |
|---|---|
| BD5 Outdoor、BD4 Outdoor | 細長白色 |
| BE5000、BE3600、BD5、BD4、ET9/AXE7800 | 白色方塊 |
| BE14000、BT8P、BT6/BT8、BT10、BQ16 Pro/BE30000、BQ16 | 白色直立 |
| Pro ET12、Pro XT12 | 黑色直立 |

- 點任一型號 → `modem-unplug` 1_033（先重新啟動數據機）。所有型號都接到同一頁。
- **待確認**：Figma 截圖最下面還有第 6 排，被畫面切掉了，看不到型號名稱。

### 5.3a `1_033` / `1_036` 重新啟動數據機 `modem-unplug` / `modem-plug`
- 來源：使用者提供的參考圖（不是 Figma）。文字和內容照參考圖，版型沿用 1_080–1_110 Setup Guide。
- 導覽列同 Setup Guide：‹ 返回、標題「Setup Guide」、右邊 ? 說明（→ `help`，待提供）。
- 插圖用 SVG 直接畫（`modemIllust()`，沒有圖檔），動畫用 SVG SMIL，讓電線形狀可以跟著插頭變：黑色數據機（POWER / DS / US / ONLINE 四顆燈）、淺藍光暈、灰色電源線、牆上插座。
- **1_033 拔下數據機和舊路由器的電源線**（依舊 App 設定指南改寫，版型同 1_080–1_110：上方插畫沒有背景圓圈）：插畫是兩張輪播，和下方編號條列 1 對 1 對應——目前那一項編號變藍、文字變深（`#333`），另一項變淡；可左右滑圖、點條列或點圓點切換，沒碰的話每張動畫播完就自動換下一張（條列跟著亮起，第 1 張停 6 秒、第 2 張停 3 秒，從切到該張時起算）；每次切到某張圖，該張動畫從頭播一次（SMIL，切換時換上新的 SVG 複本重播，Safari 也可靠）。① 拔下纜線／DSL 數據機電源線。如有備用電池，請取出電池（圖：插頭先插在牆上插座，黃色箭頭淡入並往左推兩下示意要拔，接著插頭往左拔出、電線跟著彎；再來是備用電池：電池畫成外框＋黃色 ⚡（不畫電量格，避免誤會成要充電），一開始在數據機的電池槽裡，黃色箭頭淡入往左推兩下，電池往左滑出後淡出消失，留下空的虛線電池槽）② 如果有其他無線設備連接到數據機，也請拔掉設備的電源（圖：舊路由器和延伸器用網路線接數據機，電源插在地上的延長線；綠燈先閃爍，約 1 秒後兩支插頭往上拔出、電線跟著動，燈隨即熄滅變灰，再浮現紅色斜線的電源關閉標記）。標題「拔下數據機和舊路由器的電源線」，按鈕 I am ready → 1_036（WAN 流程 → 1_034）。插畫都是重畫的 inline SVG。
- **1_036 插入您的裝置**（依舊 App 設定指南 1./2./3. 三張圖改寫，版型和輪播同 1_033：沒有背景圓圈，三張圖和下方編號條列 1 對 1，切到哪張就從頭播一次，沒碰的話動畫播完就自動換：第 1 張停 2.4 秒、第 2 張 2.6 秒、第 3 張 3.8 秒）：左邊 ZenWiFi 路由器（底部埠：電源孔、兩個黃色 LAN、藍色 WAN），右邊數據機。① 找到路由器上的 WAN 網路埠（藍色）（圖：深藍圓形放大標記彈出蓋在 WAN 埠上，外圈藍色光環持續擴散）② 用網路線將數據機的 LAN 網路埠連接到路由器的 WAN 網路埠（圖：藍色網路線從數據機黃色 LAN 埠一路畫到路由器 WAN 埠，兩端接頭依序出現）③ 同時打開數據機和路由器的電源（圖：兩支電源插頭在兩台電源孔正下方，旁邊黃色箭頭淡入往上推兩下，插頭往上插進電源孔、冒出黃色小火花，接著路由器燈條亮藍並帶光暈、持續閃爍，數據機四顆燈依序亮綠、帶光暈並持續閃爍）。標題「插入您的裝置」，按鈕 I am ready → `led-check` 1_040（WAN 流程 → 1_037）。1_033 和 1_036 共用 `stepCarousel()`／`mountStepCarousel()`。
- **兩條流程看到的版本不同**：設定流程（從 1_030 進來）用下面的新版輪播；WAN 流程（1_120 判斷「沒有 WAN、要不到 IP、US SKU」）**維持原本舊版**——黑色數據機 SVG 插拔動畫（`modemIllust()`）、英文標題 Unplug the modem’s power.／Plug the modem back in.、Do not press the Reset button 提示框和 why 說明，按鈕 I am ready，中間照舊接 1_034（3 分鐘）和 1_037（3 分半）等待頁。
- **兩條流程共用這兩頁**（`MODEM_FLOW`）：進到 1_030 時是「設定」流程（1_030 → 1_033 → 1_036 → 1_040）；進到 1_120 時是「WAN」流程（見 5.3b）。按鈕去向和沒有瀏覽紀錄時的返回目標會跟著流程變。

### 5.3b 未偵測到 WAN：`1_034` / `1_037` 等待數據機 `modem-wait-off` / `modem-wait-start`
- 來源：使用者提供的參考圖。版型沿用 Setup Guide（導覽列 ‹ 返回、Setup Guide、?）。
- 流程：1_120 Get Started → DEMO 判斷 WAN 選 **2 沒有偵測到 WAN、要不到 IP、US SKU** → 1_033 拔電 → **1_034 等 3 分鐘** → 1_036 插回 → **1_037 等 3½ 分鐘** → 倒數結束按 Continue 直接到 1_140（不再判斷重啟後是否偵測到 WAN），接著照常走 1_150 → 1_160 → 1_170 → AiMesh 1_180–1_200，1_200 之後照常問「Internet Connected?」（見 5.13）。
- 插圖區放一張淺灰圓角卡片：上方藍色小字（WAIT 3 MINUTES / WAIT AT LEAST 3½ MINUTES）、68 pt 藍色粗體倒數（3:00 / 3:30）、藍色進度條、灰色提示（Continue unlocks when the timer ends. / Blinking lights? Keep waiting.）、小數據機圖。
  - 1_034：燈全滅、插頭拔在旁邊，標籤 POWER OFF。
  - 1_037：電源線插著，燈號綠色閃爍，標籤 STARTING UP / LIGHTS MAY BLINK。
- 標題 Keep the modem unplugged. / Wait for the modem to start.
- **Continue 一開始是灰色不能按，倒數到 0:00 才亮起**（倒數數字和進度條同時變綠）。
- **DEMO 倒數**：從 3:00／3:30 開始，前 10 秒照真實時間倒數，之後剩下的時間在 3 秒內跑完，方便展示倒數結束時 Continue 從灰色變藍色。Continue 倒數中是灰色，但為了 demo 灰色時也能直接按，不用等倒數結束；倒數結束變藍色。

- **為什麼要做這一步（只在 WAN 流程顯示）**：從 1_120 判斷 2（沒有偵測到 WAN、要不到 IP、US SKU）進來時，使用者在 1_030 後可能已經重啟過一次數據機，為了避免「怎麼又要做」的疑問，1_033／1_034／1_036／1_037 的標題下方多一段 15 pt 灰字說明（`.modem-why`）。從 1_030 進來的設定流程不顯示。
  - 1_033 拔電：路由器從數據機拿不到網路（IP 位址）；美國常見的 cable modem 會綁住第一台連上的裝置，重啟數據機才能改用新的 ASUS 路由器。
  - 1_034 等 3 分鐘：數據機要斷電幾分鐘才會完全重置、忘記原本綁定的裝置，太早插回可能還是舊的連線。
  - 1_036 插回：重新通電讓數據機重新連上網路業者，準備好和新路由器配對。
  - 1_037 等 3½ 分鐘：開機並重新連上網路業者需要幾分鐘，完成後路由器才能從數據機拿到網路位址。

### 5.4 `1_040` 燈號顯示頁 `led-check`
- Figma node：`1867:1962`
- **淺色頁面**：Figma 原稿是深藍星空背景，依需求**改成白底**，配色改用淺色頁面 token；文字維持原稿英文。
- 導覽列：左邊 ‹ 返回（→ 1_036；原稿沒有，依返回規則加上），標題「系統設定」（一般字重、深色）。
- 由上而下：

| 元件 | 規格 |
|---|---|
| 裝置圖 | `assets/zenwifi-device.png`（223 × 271，56 KB），顯示 120 × 146，置中；加柔和陰影（`drop-shadow`，沿著裝置外形），讓白色裝置在白底上看得出來 |
| 標題 | 「Please check the indicator lights on your router.」20 pt semibold，置中，寬 307 |
| 燈號 1 | 綠色色塊 `#4af26d` + **Breathing Green** / Your router is starting up…；色塊會呼吸閃爍 |
| 虛線箭頭 | 從燈號 1 指向燈號 2 |
| 燈號 2 | 藍色色塊 `#00adff` + **Solid Blue** / Ready for setup. |
| 勾選框 | 「I confirm it is solid blue light on the router.」預設**不勾** |
| Next 按鈕 | 勾選後才能按 → `qr-intro` 1_050 |
| 文字連結 | 「It is not solid blue light.」→ `led-not-blue`（待提供；Figma 的綠色箭頭從這裡往下拉） |

- 燈號區塊**不加底色**（淺色頁面的 `--panel` 是透明），左右邊距 38。

### 5.5 `1_050` QR Code 找裝置 `qr-intro`
- Figma node：`711:117`
- **淺色頁面**
- 導覽列：左邊 ‹ 返回（→ `led-check` 1_040），標題「華碩 ZenWiFi 系列」，右邊藍色 ? 說明（→ 跳出 iOS 選單，見 5.5a）

| 元件 | 規格 | 動作 |
|---|---|---|
| 副標 | 「掃描 ASUS Router 上的 QR Code。」17 pt，藍色，置中 | — |
| 插圖 | 249 pt 的淺藍圓形，中間放裝置圖（同 1_040），正面貼一張 QR Code 暫代圖（不能掃） | — |
| 分隔線 | 寬 341，`--divider` | — |
| 說明 | 「在您的 ASUS 路由器上可以找到 QR Code。」＋ 1. 在可拆除的透明塑膠環上。 2. 在背面/底部的標籤上。（16 pt） | — |
| 啟用相機和掃描 | 白色膠囊按鈕 + QR 圖示 | → `qr-scan` 1_060（主要流程） |
| 手動 WiFi 連線 | 白色膠囊按鈕 + WiFi 圖示 | → `manual-wifi`（待提供） |
| 設定指南 | 小文字連結 | → `setup-guide` 1_051 |

### 5.5a `1_050` 的 ? 說明：選單、Setup Guide `1_051`–`1_055`、LED Guide `1_056`
- Figma node：`1867:942`（選單）、`1891:1333`（Setup Guide 5 頁 + LED Guide；原稿是 App 截圖）。LED Guide 插圖從原稿裁成小 JPG（`led-guide-device.jpg`）；Setup Guide 插圖已改成和 1_033 同風格的 inline SVG（原本的 `sg-*.jpg` 已刪除）。
- **? 選單**：iOS action sheet，畫面（含狀態列）變暗，從下往上滑出。上方一組：Setup Guide → 1_051、LED Guide → 1_056；下方獨立的 Cancel（粗體）。按 Cancel 或暗色區域關閉。
- **Setup Guide**：改成和 1_033／1_036 一樣的扁平插畫風格（沒有背景圓圈），導覽列 ‹ 返回 + Setup Guide，沒有 ?；原本按鈕下方的 5 顆頁碼點拿掉（輪播頁自己有圓點）。插圖比 1_080 系列小一點：輪播圖寬 360 pt（1_033／1_036 共用同一尺寸），1_051 四樣物品各 96 pt。

| 頁碼 | 標題 | 插圖 | 說明 | 按鈕 |
|---|---|---|---|---|
| 1_051 | What we’ll need | 2×2 重畫的扁平圖（沒有圓形底）：Modem、Router、Power cord、Ethernet cord，進頁時四樣依序往上浮現 | Find these in your ASUS router’s packaging. … More can be set up later. | Next → 1_052 |
| 1_052 | 拔下數據機和舊路由器的電源線 | **同 1_033**：兩張動畫輪播對應 2 條條列 | 同 1_033 | I am ready → 1_053 |
| 1_053 | 插入您的裝置 | **同 1_036**：三張動畫輪播對應 3 條條列 | 同 1_036 | I am ready → 1_054 |
| 1_054 | Prepare Another Node | 兩張動畫輪播（同 1_033 版型）：① 路由器（恆亮藍燈）在左，節點從右邊滑進來，接著出現藍色虛線雙箭頭和「≤ 3 m」標籤 ② 節點電源插頭（黃色箭頭推兩下）往上插進電源孔，燈號呼吸綠燈閃爍，約 2.5 秒後變恆亮藍燈並帶光暈 | 條列 1. Place your node(s) and router within a proper distance. 2. Power node(s) on and wait until you see a static blue light. … | Next → 1_055 |
| 1_055 | **同 1_040** 燈號顯示頁 | 同 1_040 | 同 1_040 的燈號說明（呼吸綠燈／恆亮藍燈），但拿掉勾選框「I confirm it is solid blue light on the router.」、Next 和「It is not solid blue light.」——指南只是說明，不用確認 | 只有一顆 **Done** → 回 1_050 |

- **LED Guide 1_056**：導覽列只有標題 LED Guide；裝置圖；說明文字；7 列燈號（色塊 + 說明，列與列之間有分隔線）；白色膠囊 OK → 回上一頁。
  - 綠：starting up／藍：ready for setup／**藍色閃爍**：node syncing（原稿這格是空的，推測是截到閃爍熄滅的瞬間）／白：online／黃：連線弱／紅：沒有網路或節點斷線／**綠色呼吸**：mesh 最佳化中（含 DFS 雷達說明）。
  - 原稿文字是 ZenWiFi XT9，這裡統一改成本原型的 ZenWiFi BT8。

### 5.6 `1_060` 啟用相機掃描 `qr-scan`
- Figma node：`711:155`
- **淺色頁面**
- 導覽列：左邊 ‹ 返回（→ `qr-intro` 1_050），標題「連線到ASUS Router」
  - Figma 截圖標題上方多了一個「Router」字樣，看起來是截圖時標題正在切換，不做。

| 元件 | 規格 | 動作 |
|---|---|---|
| 副標 | 「將相機對準 QR Code。」17 pt，藍色 | — |
| 相機畫面 | 331 × 331 方形，用 HTML/CSS 模擬相機畫面：近拍白色路由器機身，上面貼著白色 QR Code 標籤（25 × 25 仿真 QR，不能掃，下方寫 SSID: ASUS_14_BT8）；畫面略為模糊並輕微晃動，像手拿手機在對焦；四角綠色框，綠色掃描線上下移動。掃到時畫面停止晃動、變清楚，掃描線消失，黃色偵測框縮放框住 QR Code | 點一下 → 立刻模擬掃到 |
| 說明 | 置中 15 pt：QR Code 位置（同 1_050）＋「確定您在光線充足的環境下進行掃描。」 | — |
| 手動 WiFi 連線 | 白色膠囊按鈕，寬 277 | → `manual-wifi`（待提供） |

**互動流程（模擬）**
1. 進入頁面後，掃描線開始移動。
2. 2.5 秒後（或點相機畫面）視為掃到 QR Code，跳出 iOS 系統對話框：「『華碩路由器』想要加入 Wi-Fi 網路『ASUS_14_BT8』嗎？」
3. **取消** → 關閉對話框，重新掃描（2.5 秒後再跳一次）。
4. **加入** → `detecting` 1_070。

**⚠️ PWA 技術限制**
- **相機掃 QR Code**：PWA 可以做到（`getUserMedia` 開相機 + 解析 QR Code），但第一次要使用者允許相機權限。
- **加入 Wi-Fi**：這個對話框是 iOS 原生 App 才能叫出來的（`NEHotspotConfiguration`），**網頁／PWA 沒有辦法自動連 Wi-Fi**。正式做成 PWA 時，這一步要改成「請使用者到 iPhone 設定 → Wi-Fi 手動連線到 ASUS_xx」的引導頁。原型階段先照 Figma 模擬。

### 5.7 `1_070` 偵測路由器 `detecting`
- Figma node：`711:107`
- **淺色頁面**；導覽列：‹ 返回（→ 1_060）+ 標題「Detecting」（藍色）
- 畫面中間：「Searching for ASUS router...」17 pt 藍色（`--btn`），下方 40 pt 是轉圈圖示。
- **約 2 秒後自動跳到 `guide-1` 1_080**。用「取代」的方式換頁，所以在設定指南按返回不會再回到這頁（避免又自動跳走）。

### 5.8 `1_080`–`1_110` 設定指南 `guide-1`～`guide-4`
- Figma node：`802:285`、`802:266`、`802:246`、`802:221`
- **淺色頁面**；4 頁共用同一個版型
- 導覽列：左邊 ‹ 返回，標題「Setup Guide」（`--guide-title`，一般字重），右邊空心 ? 說明（→ `help`，待提供）
  - 第 1 頁的返回 → `qr-scan` 1_060；第 2～4 頁回上一頁
- 版面（由上而下）：

| 元件 | 規格 |
|---|---|
| 插圖 | 固定 369 pt 高的區域；插圖寬 406～422，讓每一頁的標題都在同一個高度 |
| 標題 | 22 pt，`--brand` 藍色，置中；下方 20 pt 是分隔線（寬 354） |
| 說明 | 寬 327，17 pt，`--guide-desc` 灰色，靠左 |
| Next | `.btn-brand`，貼齊下方（離下方安全區 58 pt） |

| 頁碼 | 標題 | 說明 | Next → |
|---|---|---|---|
| 1_080 | Position AiMesh devices Properly | Ensure AiMesh devices are in an open area and on a flat hard surface. | 1_090 |
| 1_090 | Maintain Proper Distance | Place AiMesh devices within 3 meters of each other. | 1_100 |
| 1_100 | Avoid Signal Interference | Keep the AiMesh devices away from appliances and devices that use the 2.4GHz band to avoid interference. | 1_110 |
| 1_110 | Power on AiMesh Node | Turn on the node. It will automatically look for the AiMesh router, and the light will blink blue while connecting. | `welcome` 1_120 |

- 1_110 另外有：
  - 燈號說明：綠色小色塊「AiMesh node is starting up.」、藍色小色塊「AiMesh node is syncing with the AiMesh router.」
  - 「LED Color Not Matching Above?」藍色底線連結（→ `led-not-match`，待提供），在 Next 上方 15 pt
  - Figma 上的粉紅虛線框和往下的線是設計師的標註，不做。
- 插圖：從 Figma 匯出後裁切，存成 `assets/guide-1.jpg`～`guide-4.jpg`（每張 20～28 KB，四張共約 92 KB），和原稿一致。
- ⚠️ 設定指南的藍色（`#006ce1`）和前面頁面的按鈕藍（`#0293f8`）不同，原稿如此，之後可以考慮統一。

### 5.9 `1_120` 安裝歡迎頁 `welcome`
- Figma node：`757:192`
- **淺色頁面**
- 導覽列：左邊 ‹ 返回（回上一頁），標題「System Setup」（`--guide-title`，semibold），右邊空心 ? 說明（→ `help`，待提供）

| 元件 | 規格 | 動作 |
|---|---|---|
| 產品圖 | `assets/bt8-3pack.jpg`（ZenWiFi BT8 三入組，828 × 529，31 KB），顯示 276 × 176，置中 | — |
| 機型名稱 | 「ZenWiFi BT8」31 pt，`--brand` 藍色，置中 | — |
| Get Started | `.btn-brand`，258 × 47，21 pt | → 跳出 **DEMO 流程判斷：WAN**（見 6.2） |
| Advanced Settings | 15 pt 藍色底線連結，在按鈕下方 24 pt | → `advanced-settings`（待提供） |

- 機型名稱和產品圖目前是固定的 BT8；之後如果要依掃到的機型變化，再改成變數。

### 5.9a `1_125` 選擇網路連線類型 `wan-type`（沒有偵測到 WAN）
- Figma node：`1867:563`（預設）、`1867:600`（展開 Special options）、`1867:774`（Detecting...）。三張是同一頁的不同狀態。
- 進入：1_120 Get Started → DEMO 判斷 WAN 選 **3 沒有偵測到 WAN**。
- 導覽列：‹ 返回（→ 1_120）+ System Setup（粗體）+ ?。
- 「請選擇您的網路連線類型（WAN Type）」；藍色小標 Wan Type；三個單選（有分隔線）：DHCP（Default，預設選取）／PPPoE／Static IP，每個下方有一行灰色說明。
- **Special options**：點一下展開／收合（箭頭翻轉），展開後是 Phone Modem：iPhone／Android 單選（和上面同一組），下方灰字 No wired internet service, but mobile hotspot is available.
- **Next**（藍色）→ 1_140。
- **Auto Detect**（藍色粗體文字）→ 畫面中央跳出黑色圓角方塊（轉圈 + Detecting...），約 1.8 秒後跳出 **DEMO 流程判斷：Auto Detect**（見 6.2）：Yes → 1_140；No → 留在 1_125，跳出 iOS 提示（Figma `1867:771`）。
- **No 的提示**：畫面變暗，中央白色圓角卡片：標題「連線無線路由器」；灰字「無法偵測到您的 WAN 狀態。請檢查網路線是否已插入路由器的 WAN 連接埠和數據機的連接埠。若皆已插入，請將網路線拔下然後重新插入，或使用其他網路線嘗試連線。」；灰色膠囊按鈕「確定」→ 關閉提示，留在 1_125 讓使用者手動選 WAN Type。

### 5.10 `1_130` 偵測網路連線 `wan-detecting`（WAN Detected = Yes）
- Figma node：`757:189`
- 和 1_120 同一個版面（產品圖、機型名稱），差別：
  - 返回箭頭是深色 `--guide-ink`
  - 機型名稱下方加一條進度條（寬 306、高 4，灰底，`--guide-title` 藍色填滿，2 秒跑完）
  - 進度條下方：「Detecting your Internet connection status...」17 pt `--brand` 藍色，兩行置中
  - Get Started 變成**不能按**：深灰底 `#5a5a5a`、淺灰字
  - Advanced Settings 變成灰色，不能按
- **進度跑完（約 2 秒）自動跳到 `setup-ssid` 1_140**（用取代方式換頁，返回不會再回到這頁）

### 5.11 `1_140`–`1_170` 設定頁

共用版型（淺色頁面）：導覽列「System Setup」+ 右邊 ?；上方 112 pt 的淺藍圓形圖示（帶斜向長陰影）；標題 20 pt `--guide-title`；說明 15 pt 置中；表單欄位寬 402；下方 Next（`.btn-brand` 258 × 47）。

**預先填好的值**（展示用，可以直接一路按 Next；值存在 `screens.js` 的 `FORM`，換頁後保留）

| 欄位 | 預設值 |
|---|---|
| WiFi 名稱（SSID） | `timmmbt8`（照 Figma） |
| WiFi 密碼 | `Asus2026@BT8!` |
| IoT WiFi 名稱 | 主網路名稱 + `_IoT` → `timmmbt8_IoT` |
| IoT WiFi 密碼 | `Asus2026@IoT!` |
| 管理帳號 | `timmmbt8`（照 Figma） |
| 管理密碼 / 確認密碼 | `Admin2026@BT8!` |

密碼欄位預設顯示成圓點，按 👁 可以看到內容。這些只是原型的示範值。

| 頁碼 | 頁面 | Figma | 內容 | 按鈕 |
|---|---|---|---|---|
| 1_140 | 建立 WiFi 網路 `setup-ssid` | `757:185` | WiFi 圖示；Create WiFi Network；SSID（可清除）、密碼（強度）、□ Separate WiFi network | Next → 1_150（SSID 空白或密碼太弱時不能按）；返回 → 1_120 |
| 1_150 | 建立 IoT 網路 `setup-iot` | `757:182` | 房子+齒輪圖示；Create Iot Network；說明 IoT／舊裝置可能和 WiFi 7 不相容；IoT SSID、密碼 | Next → 1_160；Set Up Later（淺藍文字，佔 Next 下方 62px，讓 Next 和 1_140 同高）→ 1_160 |
| 1_160 | 設定登入帳號 `setup-account` | `757:179` | 人像圖示；Set up Local Login Account；Username、Password（強度）、Confirm Password | Next → 1_170；兩次密碼不一致時顯示紅字「Passwords do not match.」且不能按 |
| 1_170 | 套用設定 `setup-apply` | `757:176` | ‹ 返回（→ 1_160）；裝置圖（同 1_040，166 × 202）；Setting up your network（`--brand`）；進度條 3 秒；Now applying your settings. | 約 3 秒後自動 → 1_175 |

### 5.11a `1_175` 加入新的 Wi-Fi `join-wifi`
- Figma node：`1867:1018`（原稿是截圖）。
- 1_170 套用設定後，路由器的 WiFi 換成 1_140 設定的名稱，手機要重新加入。
- 導覽列：‹ 返回（→ 1_160；原稿沒有，依返回規則加上。不回 1_170，因為 1_170 會自動跳回這頁）+ 標題 System Setup（粗體，沒有 ?）；下方是三入組產品圖（同 1_120）。返回鍵被提示的暗色遮罩蓋住，系統提示是強制回應，要先關掉提示才按得到。
- 畫面變暗，跳出模擬的 iOS 系統提示（沿用 1_060 的 `.ios-alert`）：“ASUS Router” Wants to Join Wi-Fi Network “<1_140 的 SSID>”?（原稿的範例是 asus1234）
  - **Join** → 1_180 AiMesh 建立中
  - **Cancel** → 待提供

### 5.12 `1_180`–`1_200` AiMesh 建立中 `mesh-1`～`mesh-3`
- Figma node：`803:414`、`803:400`、`803:383`
- 版型同設定指南（5.8）：插圖區 369 pt、標題同位置；**分隔線換成進度條**（寬 294、高 5，`#e9e9e9` 底、`--guide-title` 填滿）；導覽列只有 ‹ 和「Setup Guide」，沒有 ?
- **自動前進**：每頁約 1.7 秒（進度條動畫 1.6 秒）。進度條是連續的：1_180 跑 0→33%、1_190 跑 33→66%、1_200 跑 66→100%，看起來像同一條進度條一路跑完。

| 頁碼 | 標題 | 說明 | 插圖 |
|---|---|---|---|
| 1_180 | Establishing AiMesh Network | Keep the AiMesh devices away from appliances and devices that use the 2.4GHz band to avoid interference. | 兩台節點連線、時鐘（`mesh-1.jpg` 28 KB） |
| 1_190 | AiMesh Network optimization | The AiMesh node(s) are now automatically joining the network, no manual setup is needed. | 一台節點、窗戶、花瓶（`mesh-2.jpg` 21 KB） |
| 1_200 | AiMesh Network optimization | We could run the optimization in the background so you can start browsing instantly. | 節點在櫃子上、沙發、立燈（`mesh-3.jpg` 23 KB） |

- 1_200 下方有「Run in background」藍色底線連結（`#007bfe`），效果和等 1_200 自動跑完一樣：留在 1_200 並跳出 DEMO 判斷「Internet Connected?」，見 5.13。

### 5.13 1_200 之後的流程（Internet Connected?）
- 來源：Figma `b6i9sXOWaZ4TQnSlif6iu7`（Untitled）Page 1 的流程圖；下面各頁的 Figma node 指這個檔案（1_210、1_230、1_280 沿用原本 QIS_Prelink 的頁面）。
- 1_200 跑完（或按 Run in background）→ DEMO 判斷，全部判斷見 6.2：

```
1_200 ─ Internet Connected?（link internet = 2 & ping 通 internet）
 ├ Yes ─ node 台數？
 │   ├ 0 台 ─ 1_210 → 1_230 Finish → 1_280 首頁
 │   └ ≥ 1 台（優化中／品質待優化／沒有回應）─ 1_220 ─ Next → 1_230 Finish → 1_290 AiMesh 拓撲
 │                                   └ Trouble shooting → 1_300 → 對應的燈號頁 → 1_230
 └ No ─ node 台數？
     ├ ≥ 1 台（優化中 1_310／品質待優化 1_320／沒有回應 1_330）─ 1_300 → … ─┐
     └ 0 台 ──────────────────────────────────────────────────────┤
                                                Mobile 行動網路？ ┘
                                                 ├ Yes ─ 1_230 Next → 1_340 ─ 完成設定 → 1_360
                                                 │                         └ Feedback → 1_345 同意 → 1_350 發送 → 1_360
                                                 └ No ── 1_230 Finish → 1_360
```

- 1_230 設定摘要是同一頁，**按鈕和去向跟著分支變**：單台 Finish → 1_280；多台 Finish → 1_290；行動網路 Yes：Next → 1_340；行動網路 No：Finish → 1_360。單台以外標題列下方多一行「Setup complete」（照 Figma）。
- 1_300 的節點狀態依「node 台數」選的狀態（節點優化中／連線品質待優化／節點沒有回應）顯示不同圖文；有網路時從 1_220 Trouble shooting 進來，也是看「node 台數」選的狀態。
- 「node 台數？」在 Internet Connected? 選 Yes 或 No 後都會問，選項一樣（0 台／≥ 1 台三種狀態）。原本 Yes 後的「node Prelink 台數？」已併進來：0 台 = 原本的單台，≥ 1 台 = 原本的單台／多台（>1 台未連回）。
- Figma 上的線狀態／燈號狀態說明（洋紅色註解）：綠線／白燈 = good connection（AiMesh Node is ready）；動態藍線／藍燈 = 節點正在優化（AiMesh Node is optimising）；黃線／黃燈 = 連線品質需要優化（weak，connection quality can be improved）；灰線 = 節點 offline（no response，沒有 MAC address）。

### 5.13a `1_210` / `1_220` 網路已連線 `internet-live` / `internet-live-mesh`
- Figma node：`1867:2040`（Figma 是靜態圖，**這頁完全用程式自己畫，加上完成的動態效果**）；1_220 對應新 Figma `0:377`，沿用 1_210 的畫面
- 導覽列：‹ 返回（沒有紀錄時 → 1_200）+「Setup Guide」
- **1_210（單台）**和 **1_220（單台／多台，>1 台未連回）**畫面相同；1_220 在標題下多一段「Let’s keep checking your AiMesh node(s) status in following steps.」（16 pt `#555`，置中），Next 下方多一個「Trouble shooting」藍色底線連結 → 1_300
- 動畫順序：
  1. 0 秒：路由器（`zenwifi-device.png`）從下方彈出來，下面有一條層架
  2. 0.35 秒起：15 個彩色紙花（三角形、圓環、長條、圓點、齒輪、地球、星星）從路由器後面**往外炸開**，接著稍微往下飄並**淡出消失**（約 2 秒內全部消失，只出現一次）
  3. 0.5 秒起：路由器後方**一圈圈圓形藍色波紋**往外擴散、淡出，**一直重複**，表示持續在傳送訊號；最後畫面只剩路由器、勾勾和圓形波紋
  4. 1.1 秒：路由器右上角**綠色勾勾彈出**，0.35 秒後畫出勾號
  5. 1.3 秒：標題「Internet Connection is Live!」（22 pt semibold `#2f86e0`）淡入往上
  6. 1.6 秒：白色膠囊按鈕 Next 淡入 → `summary` 1_230
- 使用者有開「減少動態效果」時，直接顯示最後的畫面（不顯示紙花和波紋）。

### 5.14 `1_230` 設定摘要 `summary`
- Figma node：`819:320`
- **淺色頁面**；導覽列：‹ 返回（單台 → 1_210；多台 → 1_220；沒網路 → 1_200）+「System Setup」
- 由上而下：產品圖（只有路由器一台時 → 一台 BT8 `home-offline-device.jpg`，139 × 169：node 台數選「0 台」（有網路，或沒網路後的行動網路 Yes／No）；有節點的分支 → 三入組 `bt8-3pack.jpg`，264 × 169，兩張同高）→ 分隔線 → **Summary** → 分隔線 → **Guest Network** → Finish

| 區塊 | 圖示 | 內容（**帶入 1_140～1_160 填的值**） |
|---|---|---|
| Summary | 藍色 Wi-Fi + 2G | WiFi Name：SSID；WiFi Password：WiFi 密碼 |
| Summary | 藍色 Wi-Fi + 5G | WiFi Name：SSID + `_5G`；密碼同上 |
| Summary | 藍色 Wi-Fi + 6G | WiFi Name：SSID + `_6G`；密碼同上 |
| Summary | 藍色人像（空心） | Username；Password：管理密碼 |
| Guest Network | 綠色 Wi-Fi + IOT | WiFi Name：IoT SSID；WiFi Password：IoT 密碼 |

- 文字 16 pt `#555`，每列兩行；區塊標題 17 pt `#222`；分隔線寬 386。
- Figma 原稿的密碼都是 `12345678`，原型改成顯示實際填的值。
- 5G / 6G 名稱照 Figma 加上後綴（即使沒勾 Separate WiFi network）；之後可以依勾選狀態決定要不要分開顯示。
- 按鈕依分支變化（見 5.13）：單台 **Finish** → 1_280；多台 **Finish** → 1_290；行動網路 Yes **Next** → 1_340；行動網路 No **Finish** → 1_360
- 單台以外，三入組圖下方多一行「Setup complete」（20 pt `--brand`）

### 5.15 `1_280` 首頁 `home`
- Figma node：`1728:569`（原稿是 ASUS Router App 首頁截圖，**盡量照原畫面重做**）
- 白底；沒有導覽列，改用自己的頂部列

| 區塊 | 規格 |
|---|---|
| 頂部列 | 左：‹ 返回（→ 1_230，依返回規則加上）＋ 52 pt 圓形頭像（Google G，白邊＋陰影）＋「首頁」21 pt `#5b9be6`；右：白色膠囊（174 × 52，陰影）內有 ⓘ、🔔、＋（`#4a90e2`） |
| 路由器卡片 | 411 × 85，白底，藍色光暈陰影 `rgba(74,144,226,.35)`；左：裝置小圖＋「ZenWiFi BT8」；中：區域網路 IP »（灰）/ 192.168.50.1（藍）/ 無線網路名稱（灰）/ **SSID（帶入 1_140 的值）**；右：直線分隔＋灰色測速儀圖示 |
| 即時流量 | 標題 21 pt `#2a62d6`；下方 416 × 253 的**即時流量圖** |
| 下載 / 上傳 | 淺藍圓圈↓「下載」、綠色圓圈↑「上傳」；數值 21 pt `#555`，**跟著流量圖即時更新**（超過 1000 Kbps 自動換成 Mbps） |
| 分頁點 | 4 個點，第 1 個 `#4a7fd6`，其他 `#b8cff0` |
| 功能圖示 | www 地球（深藍，目前選中）、房子＋Wi-Fi、Wi-Fi 圓圈（淺藍 `#a8c4ef`） |
| 底部分頁列 | 浮動膠囊（左右 25、高 71），淺灰底＋陰影；首頁（選中：灰色膠囊底、藍字）、裝置（藍色角標 2）、提示、家庭、設定 |

**即時流量圖**（`<canvas>`，`startTrafficChart()`）
- 下載：淺藍填色 `rgba(120,200,245,.75)` + 藍線；上傳：淺綠填色 + 綠線；底部一條綠色基準線。
- 圖會**一直往左平滑捲動**，每 0.6 秒從右邊進來一個新數值；偶爾出現一段流量高峰（模擬下載）。
- 進入頁面時的初始畫面照原稿：左邊幾乎沒流量，右邊有一個大高峰。
- 縱軸會自動依畫面中最高的值慢慢縮放。
- 離開頁面時停止動畫。

- 右上角 **＋（新增裝置）→ `opening` 1_010**，回到 QIS 第一頁重新設定（和實際 ASUS Router App 用「＋」新增路由器的習慣一致）。
- 其他按鈕（頭像、ⓘ、🔔、卡片、測速、功能圖示、分頁列）目前都是「頁面尚未加入」。

### 5.16 `1_290` AiMesh 拓撲 `aimesh-topology`
- Figma node：`0:81`；多台流程按 1_230 Finish 進入
- 頂部列、路由器卡片、功能圖示、底部分頁列沿用 1_280；中間是「AiMesh WiFi 系統」標題、拓撲圖（`aimesh-topology.jpg`：網際網路 → 主路由器 → 兩台節點，MLO 連線）、白色膠囊「新增節點｜最佳化」；功能圖示中 AiMesh 為選中
- 拓撲圖是 Figma 的截圖，裝置名稱顯示 ZenWiFi BT6（原稿如此）

### 5.17 `1_300`–`1_330` AiMesh 節點連線狀態與燈號排除 `node-status`、`node-guide-1`～`node-guide-3`
- Figma node：`0:182`（沒有回應）、`0:252`（優化中）；連線品質待優化原稿沒有，圖用沒有回應的圖把灰線改成黃線（`node-status-weak.jpg`）、`0:85`、`0:97`、`0:109`
- **1_300**：導覽列 ‹ 返回（有網路 → 1_220；沒網路 → 1_200；原稿沒有，依返回規則加上）+ 粗體「System Setup」+ ?；三台節點連線圖 →「AiMesh Node(s) Connection Status」→ 編號清單：① AiMesh Node is ready.（綠線，可連網且品質 OK）；② 依狀態：

  | 狀態 | 線 | ② 文字 | 圓圈 | 圖 | Next → |
  |---|---|---|---|---|---|
  | 優化中 | 動態藍線（正常提示） | AiMesh Node is optimising. | 白 | `node-status-optimising.jpg` | 1_310 |
  | 連線品質待優化（weak） | 黃線（黃色提示） | AiMesh Node connection quality can be improved. | 黃 | `node-status-weak.jpg` | 1_320 |
  | 沒有回應（offline，沒有 MAC address） | 灰線（黃色提示） | AiMesh Node is not responding. (No MAC address) | 黃 | `node-status-offline.jpg` | 1_330 |

  - Figma 原文「is no respondse. (No mac adress)」修正拼字
- **1_310–1_330**：版型同設定指南（‹ 返回、Setup Guide、?；插圖區 340 pt），標題 19 pt semibold `#2f86e0`、沒有分隔線；說明 15 pt `#666`

| 頁碼 | 標題 | 插圖 |
|---|---|---|
| 1_310 | Stand by the blinking blue light turns white | 打勾的節點（`node-guide-white.jpg`） |
| 1_320 | Improve connection quality when the light is yellow | 兩台節點黃線（`node-guide-yellow.jpg`） |
| 1_330 | Power on the node if indicator remains off | 開電源的節點（`node-guide-power.jpg`），說明下方有綠色／藍色燈號圖例 |

- **每個節點狀態只顯示對應的一頁燈號頁**：優化中 → 1_310（藍燈閃爍）；連線品質待優化 → 1_320（黃燈）；沒有回應 → 1_330（打開電源）。返回都 → 1_300。從 1_220 Trouble shooting 進來時一樣看「node 台數」選的狀態。
- 燈號頁的 Next：沒網路時 → DEMO 判斷「Mobile 行動網路？」；從 1_220 Trouble shooting 進來（有網路）→ 1_230
- Figma 原文「please enure」修正為「please ensure」

### 5.18 `1_340`–`1_360` 尚未連上網際網路 `no-internet`、`feedback-consent`、`feedback`、`home-offline`
- Figma node：`0:150`、`0:169`、`0:398`
- **1_340**：導覽列 ‹ 返回（→ 1_230；原稿沒有，依返回規則加上）+ 粗體「System Setup」；地球加驚嘆號圖（`no-internet-globe.jpg`）、「裝置設定已完成」（19 pt semibold `#1b74e4`）、「您的環境目前尚未連上網際網路」；最下方淺藍 **Feedback** 卡片（提供問題資訊，協助我們了解您的連線狀況）→ 1_345，深藍 **完成設定** → 1_360
- **1_345 協助改善使用體驗** `feedback-consent`：回報前的同意頁，導覽列 ‹ 返回（回上一頁）+ 置中藍色標題，內文為華碩隱私權聲明與歐盟數據法聲明（1–4 項，子項目用 (1)(2)(3)），「華碩隱私權保護政策」「個人資料客戶申請」為藍色底線連結（目前不可點）；內文可捲動，下方固定兩顆藍色膠囊按鈕：**拒絕** → 返回上一頁、**同意** → 1_350（1_350 一進來先在畫面中央顯示 2 秒黑底轉圈 Loading...，樣式同 1_125 Auto Detect 的 Detecting... 方塊）。所有進入問題回報的入口（1_340 Feedback 卡片、1_010 問題回報連結）都先經過這頁，同意後才能回報
- **1_350 問題回報**：× 關閉（返回 → 1_345）、「問題回報」、發送 → 1_360；欄位：您所在的地區（台灣）、您的電子郵件地址（必要的）、問題回報類型（設定問題 ›）、問題回報描述（網路設定精靈 ›）、評論／建議（字數 0/2000，輸入時更新）、附加圖片 ›；選單類欄位淺灰底 `#efeff4`，可輸入的欄位（電子郵件、評論）改成白底 + 1px `#c7c7cc` 外框、圓角 8，聚焦時藍框 `#4a90e2`。電子郵件標籤後加紅色「* 必填」，預設帶入 `asus1234@asus.com`，placeholder「例如 name@example.com」（清空後才看得到），有內容才顯示清除鈕；按發送時格式不對會擋下、外框變紅並顯示「請輸入有效的電子郵件地址」，填對才 → 1_360（原稿是淺灰底 + 「(必要的)」，太不明顯所以改）。選單類欄位目前是「頁面尚未加入」
- **1_360**：1_280 的首頁版型，路由器卡片顯示「狀態：正在連線…」，中間「歡迎使用」「ZenWiFi BT8」和路由器圖（`home-offline-device.jpg`）；分頁列上方一條橘色 `#ff8a00`「網路連線可能異常」＋白框按鈕「詳細診斷」→ 1_370
- **1_370 網路診斷**（從 Network-Diagnostic 原型移植，393 寬 ×1.12）：頂部漸層 hero 延伸到狀態列下（狀態列白字），‹ 返回 → 1_360、「Network Diagnostic」；圓形圖示 + 標題／副標 + 白色膠囊按鈕。從「詳細診斷」進來直接開始「診斷中...」：第一列（您的裝置）轉 4 秒，之後每 1 秒揭曉下一列（華碩路由器 → 上游網路設備 → 網際網路）；任一列 ❌ 就停止。整頁狀態取最差的一列：異常（紅 `#e47867`）＞ 不穩（橘 `#f6ab63`）＞ 正常（綠 `#40b9af`），按鈕變「重新診斷」。不穩列下方橘框「此段連線不穩定」，Ping／DNS 異常列下方紅框排除建議（同一列多則訊息依 Ping → DNS 疊在同一框）。點「連線檢查」開 `diagnosis` 判斷（都正常／不穩／有錯誤／錯誤＋不穩／DNS 異常／Ping 不穩＋DNS 異常／Ping 異常＋DNS 異常），選完重新跑一次；預設「有錯誤」（路由器 ❌）

## 6. 原型實作

| 檔案 | 內容 |
|---|---|
| `screens.js` | 每一頁的頁碼、說明和 `render()` HTML。新增頁面時加一筆資料 |
| `style.css` | 顏色 token、共用元件、各頁樣式、產品暫代圖 |
| `app.js` | 換頁、縮放、demo bar |

- 需要互動的頁面可以加 `mount(el)`，在頁面出現時執行，回傳的函式會在離開頁面時執行（用來清掉計時器等）。
- 任何元素加上 `data-go="頁面id"` 就能跳頁；`data-go="back"` 回上一頁。目標頁還沒做時，會顯示「頁面尚未加入」。
- 網址用 `#頁面id` 切換頁面，瀏覽器的上一頁可以用。
- 網址加上 `?debug`，會標出可點擊的範圍（粉紅色）和安全區（藍色）。

### 6.1 Demo bar（流程控制列）

沿用 site-manager 的 `FLOW://` 列，屬於**展示用的外層，不是產品 UI**。

| 項目 | 規格 |
|---|---|
| 位置 | 畫面最上方，高 32 px。App 畫布放在它**下方**，不會被蓋住 |
| 頁碼 | `<流程>_<序號>`，例如 `1_010`。序號每次加 10，方便中間插入新頁 |
| 頁碼下拉選單 | 列出所有頁面的頁碼和說明，點一下直接跳到那頁 |
| 說明 | 用一般人看得懂的一句話，說明這頁的用途 |
| RESET | 回到流程起點 |

| 情境 | Demo bar |
|---|---|
| 電腦或手機瀏覽器預覽 | 顯示 |
| 安裝成 PWA（`display-mode: standalone`） | **隱藏** |
| 網址加 `?demo=0` | 隱藏 |

### 6.2 流程判斷（DEMO 流程判斷）

沿用 site-manager 的做法：流程中需要「看情況走不同路線」的地方，按下按鈕時會跳出一個**展示用的判斷面板**，讓展示的人選要走哪條路。

| 項目 | 規格 |
|---|---|
| 面板位置 | 瀏覽器視窗右下角（不在 App 畫面裡），深色底，左上角有會呼吸閃爍的「DEMO 流程判斷」標籤，右上角 × 可以關掉 |
| 選擇後 | 依選項跳到對應頁面；同時在 demo bar 加一個**下拉選單**（例如「WAN: Yes」），之後隨時可以改選，直接跳到另一條路線 |
| 改選前面的判斷 | 後面的判斷會清掉（因為那些是舊答案帶出來的） |
| RESET | 清掉所有判斷 |
| 實作 | 按鈕加 `data-decide="判斷名稱"`；判斷內容寫在 `screens.js` 的 `QIS_DECISIONS`。選項可以用 `to` 跳頁，或用 `action` 在原頁執行（例如跳出提示）；頁面也可以自己呼叫 `window.QIS_decide(名稱)` 打開判斷 |

**目前的判斷**

| # | 名稱 | 在哪一頁觸發 | 問題 | 選項 → 頁面 |
|---|---|---|---|---|
| 0 | `wan` | 1_120 按 Get Started | WAN 偵測結果？ | 1 正常 → `wan-detecting` 1_130；2 沒有偵測到 WAN、要不到 IP、US SKU → `modem-unplug` 1_033（WAN 流程，見 5.3b）；3 沒有偵測到 WAN → `wan-type` 1_125 |
| 1 | `wanDetect` | 1_125 按 Auto Detect（Detecting... 轉約 1.8 秒後跳出） | Auto Detect：這次有偵測到 WAN 嗎？ | Yes → `setup-ssid` 1_140；No → 留在 1_125，跳出「連線無線路由器」提示，按確定關閉 |
| 2 | `internet` | 1_200 跑完或按 Run in background | Internet Connected?（link internet = 2 & ping 通 internet） | Yes、No 都接判斷 `nodeCount` |
| 3 | `nodeCount` | 接在 `internet` 後面（Yes、No 都會問） | node 台數？ | 有網路：0 台 → `internet-live` 1_210；≥ 1 台 · 節點優化中（藍線）/ 連線品質待優化（黃線）/ 節點沒有回應（灰線）→ `internet-live-mesh` 1_220（Trouble shooting 看這個狀態）。沒網路：0 台 → 判斷 `mobile`；≥ 1 台 → `node-status` 1_300 |
| 4 | `mobile` | 燈號頁 1_310／1_320／1_330 按 Next（沒網路），或 node 台數選 0 台 | Mobile 行動網路？ | Yes → `summary` 1_230（Next → 1_340）；No → `summary` 1_230（Finish → 1_360） |
| 5 | `diagnosis` | 1_370 點「連線檢查」 | 網路診斷結果？ | 7 種情境（都正常／不穩／有錯誤／錯誤＋不穩／DNS 異常／Ping 不穩＋DNS 異常／Ping 異常＋DNS 異常），選完在 1_370 重新診斷 |

- 正式 App 會自動偵測，不會有這個面板；它只是讓展示時可以切換不同情況。

### 6.3 頁碼表

| 頁碼 | 頁面 | 說明 |
|---|---|---|
| 1_010 | 啟動頁 `opening` | 打開 App 的第一個畫面，選擇「設定新網路」或「管理已連接的路由器」 |
| 1_020 | 選擇系列裝置 `series` | 選要設定的產品系列（無線路由器 / ZenWiFi / Lyra） |
| 1_030 | 選擇 ZenWiFi 裝置 `series-zenwifi` | 從清單中點選要設定的 ZenWiFi 型號 |
| 1_033 | 拔掉數據機電源 `modem-unplug` | 重新啟動數據機（1/2）：只拔數據機的電源線，等所有燈都熄滅，不要按 Reset |
| 1_034 | 等待 3 分鐘（拔電）`modem-wait-off` | 未偵測到 WAN：數據機保持拔電 3 分鐘，Continue 倒數中是灰色、倒數結束變藍色，但為了 demo 灰色時也能按（前 10 秒正常、之後加速） |
| 1_036 | 插回數據機電源 `modem-plug` | 重新啟動數據機（2/2）：把電源線插回數據機，燈號重新亮起後再繼續 |
| 1_037 | 等待數據機啟動 3½ 分鐘 `modem-wait-start` | 未偵測到 WAN：插回電源後等 3½ 分鐘，Continue 倒數中是灰色、倒數結束變藍色，但為了 demo 灰色時也能按（前 10 秒正常、之後加速），按 Continue 到 1_140 |
| 1_040 | 燈號顯示頁 `led-check` | 請使用者看路由器的燈，從呼吸綠燈變成恆亮藍燈才能開始設定 |
| 1_050 | QR Code 找裝置 `qr-intro` | 說明路由器上的 QR Code 在哪裡，選擇用相機掃描或手動連 WiFi |
| 1_051 | Setup Guide 1/5 `setup-guide` | 1_050 的 ? → Setup Guide：準備物品（數據機、路由器、電源線、網路線），扁平重畫圖依序浮現 |
| 1_052 | Setup Guide 2/5 `setup-guide-2` | 同 1_033：拔掉數據機和舊路由器的電源（動畫輪播） |
| 1_053 | Setup Guide 3/5 `setup-guide-3` | 同 1_036：數據機 LAN 埠接到路由器 WAN 埠，兩台都開機（動畫輪播） |
| 1_054 | Setup Guide 4/5 `setup-guide-4` | 準備節點：放在 3 公尺內，開機等呼吸綠燈變恆亮藍燈（動畫輪播） |
| 1_055 | Setup Guide 5/5 `setup-guide-5` | 同 1_040 燈號說明（不用勾選確認），Done 回 1_050 |
| 1_056 | LED Guide `led-guide` | 1_050 的 ? → LED Guide：路由器正面燈號顏色代表的狀態 |
| 1_060 | 啟用相機掃描 `qr-scan` | 把相機對準路由器上的 QR Code，掃到後系統詢問是否加入路由器的 Wi-Fi |
| 1_070 | 偵測路由器 `detecting` | 加入路由器的 Wi-Fi 後，App 正在搜尋 ASUS 路由器（約 2 秒後自動跳下一頁） |
| 1_080 | 設定指南 1/4 `guide-1` | 擺放位置：AiMesh 裝置要放在空曠處、平坦堅硬的表面上 |
| 1_090 | 設定指南 2/4 `guide-2` | 保持距離：AiMesh 裝置之間距離 3 公尺以內 |
| 1_100 | 設定指南 3/4 `guide-3` | 避免干擾：遠離使用 2.4GHz 頻段的家電和裝置 |
| 1_110 | 設定指南 4/4 `guide-4` | 開啟節點電源：節點會自動尋找 AiMesh 路由器，連線時燈號閃藍燈 |
| 1_120 | 安裝歡迎頁 `welcome` | 顯示偵測到的機型 ZenWiFi BT8，按 Get Started 開始設定 |
| 1_125 | 選擇網路連線類型 `wan-type` | 沒有偵測到 WAN：選擇 WAN Type，或按 Auto Detect 再偵測一次（偵測到就到 1_140） |
| 1_130 | 偵測網路連線 `wan-detecting` | 已偵測到 WAN（網路線已接），正在檢查網際網路連線狀態（約 2 秒後自動跳下一頁） |
| 1_140 | 建立 WiFi 網路 `setup-ssid` | 設定主要 WiFi 的名稱（SSID）和密碼 |
| 1_150 | 建立 IoT 網路 `setup-iot` | 為 IoT／舊裝置另建一個 WiFi，可稍後再設 |
| 1_160 | 設定登入帳號 `setup-account` | 設定路由器管理介面的帳號和密碼 |
| 1_170 | 套用設定 `setup-apply` | 路由器正在套用剛才的 WiFi 和帳號設定（約 3 秒後自動跳下一頁） |
| 1_175 | 加入新的 Wi-Fi `join-wifi` | 設定套用後路由器換成新的 WiFi 名稱，系統詢問是否加入，按 Join 繼續建立 AiMesh |
| 1_180 | AiMesh 建立中 1/3 `mesh-1` | 建立 AiMesh 網路：路由器和節點開始連線 |
| 1_190 | AiMesh 建立中 2/3 `mesh-2` | AiMesh 最佳化：節點自動加入網路 |
| 1_200 | AiMesh 建立中 3/3 `mesh-3` | AiMesh 最佳化：可以改到背景執行，先開始上網 |
| 1_210 | 完成：網路已連線 `internet-live` | 有網路、node 0 台：網際網路已連線（有完成動畫），按 Next 看設定摘要 |
| 1_220 | 網路已連線：繼續檢查節點 `internet-live-mesh` | 有網路、node ≥ 1 台：網路已連線，接著檢查節點；Trouble shooting 看節點狀態 |
| 1_230 | 設定摘要 `summary` | 列出剛設定好的 WiFi 名稱／密碼、登入帳號和 IoT 訪客網路；按鈕依分支接到不同頁 |
| 1_280 | 首頁 `home` | 設定完成後進入 App 首頁，顯示路由器資訊和即時上傳／下載流量 |
| 1_290 | AiMesh 拓撲 `aimesh-topology` | 多台：設定完成後進入 App 的 AiMesh 頁，顯示路由器和節點的連線 |
| 1_300 | AiMesh 節點連線狀態 `node-status` | 每台節點的狀況（已就緒／優化中／連線品質待優化／沒有回應） |
| 1_310 | 節點燈號排除：優化中 `node-guide-1` | 藍燈閃爍代表正在優化，完成後變白燈 |
| 1_320 | 節點燈號排除：連線品質待優化 `node-guide-2` | 黃燈代表連線品質不佳，調整擺放位置 |
| 1_330 | 節點燈號排除：沒有回應 `node-guide-3` | 燈不亮就打開節點電源 |
| 1_340 | 尚未連上網際網路 `no-internet` | 裝置設定已完成但還沒連上網，可以回報問題或完成設定 |
| 1_345 | 協助改善使用體驗 `feedback-consent` | 問題回報前的資料使用同意，同意才進 1_350，拒絕回上一頁 |
| 1_350 | 問題回報 `feedback` | 填寫地區、電子郵件和問題描述，發送後到首頁 |
| 1_360 | 首頁：網路異常 `home-offline` | 路由器還在連線中，顯示「網路連線可能異常」提示 |
| 1_370 | 網路診斷 `diagnosis` | 依序檢查裝置 → 路由器 → 上游設備 → 網際網路，顯示結果和排除建議 |

## 7. 待辦

- [ ] PWA manifest 和 App icon（需要 icon 圖檔）
- [ ] Service worker（離線快取）
- [ ] 產品去背圖（取代 CSS 暫代圖）
- [ ] 其餘頁面和跳轉關係
- [ ] 決定 PWA 版「加入路由器 Wi-Fi」的替代流程（網頁無法自動連 Wi-Fi，見 5.6）
- [ ] 1_030 第 6 排的型號名稱
- [ ] 在 iPhone 實機裝成 PWA，確認換頁時狀態列底色和文字顏色會跟著變
