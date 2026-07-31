# 🚀 Binance Futures Momentum Tarayıcı (React + Vite)

Binance Futures WebSocket (`!miniTicker@arr`) akışını canlı olarak dinleyen; **1dk, 5dk, 15dk ve 24s** zaman pencerelerindeki yüzde değişimlerini (momentum/pump/dump) hesaplayan, mobil öncelikli, yüksek performanslı ve modüler bir kripto tarayıcısı.

---

## 📌 Öne Çıkan Özellikler

- **⚡ Canlı WebSocket Akışı:** `wss://fstream.binance.com/ws/!miniTicker@arr` üzerinden 300+ USDT vadeli işlem paritesini sıfır gecikmeyle izler.
- **🔄 Otomatik Reconnect & Fallback:** Bağlantı koptuğunda exponential backoff ile otomatik yeniden bağlanır; yedek endpoint (`/market/!miniTicker@arr`) desteği sunar.
- **⏱️ Gerçek Zamanlı Rolling Window (Dairesel Tampon):** Fiyat hareketlerini anlık kayıtlarla değil, dairesel tampon (circular buffer) mantığıyla 1dk / 5dk / 15dk hareketli pencerelerde hesaplar.
- **⚡ 60 FPS Sanallaştırılmış Liste (React Window):** Yüzlerce coin kartını mobil cihazlarda dahi takılmadan 60 FPS performansla sunar.
- **📱 Mobil Öncelikli Dokunmatik UX:**
  - Mobilde kart görünümü, masaüstünde detaylı tablo görünümü.
  - Alttan açılan mobil filtre paneli (Bottom Sheet Drawer).
  - En az 44x44px dokunmatik buton ve kart hedefleri.
- **🔔 Gelişmiş Uyarı Sistemi:**
  - Belirlenen momentum eşiği (%3, %5 vb.) aşıldığında Web Audio API sentezleyicisi ile **Pump / Dump özel ses tonu** çalar.
  - Mobil cihazlarda Vibration API ile titreşimli bildirim verir.
  - Spam'i önlemek için coin bazlı cooldown süresi.
- **⭐ Favoriler & Filtreleme:** Yıldız ikonuyla favoriye ekleme (`localStorage` kalıcı depolama), gelişmiş hacim ($M USDT), fiyat, % değişim ve arama filtreleri.

---

## 📁 Klasör Yapısı

```text
src/
├── types/
│   └── ticker.ts               # Ticker, snapshot, momentum ve state tip tanımları
├── utils/
│   ├── formatters.ts           # Fiyat, hacim ($M/K), yüzde ve zaman biçimlendiricileri
│   ├── calculations.ts         # Dairesel tampon ve rolling window momentum hesaplamaları
│   └── sound.ts                # Web Audio API ses sentezleyicisi & Mobil Vibration API
├── services/
│   └── binanceSocket.ts        # WebSocket bağlantısı, 250ms batching, reconnect yönetimi
├── store/
│   └── useAppStore.ts          # Zustand global state (filtreler, ayarlar, favoriler)
├── hooks/
│   ├── useBinanceSocket.ts     # WebSocket yaşam döngüsü hook'u
│   ├── useFavorites.ts         # Favori coin yönetimi hook'u
│   └── useMomentumTracker.ts   # Memoized momentum hesaplama, sıralama & uyarı hook'u
├── components/
│   ├── Header/                 # Canlı durum rozeti, arama, hızlı zaman sekmeleri ve butonlar
│   ├── ConnectionStatus/       # Bağlantı koptuğunda beliren uyarı ve manuel yeniden bağlanma
│   ├── FilterPanel/            # Mobil Bottom Sheet / Masaüstü yan filtreleme paneli
│   ├── SettingsDrawer/         # Ses, titreşim, görünüm ve bildirim eşiği ayarları
│   ├── Alerts/                 # Ekran altı toast bildirimleri ve uyarı geçmişi çekmecesi
│   ├── CoinList/
│   │   ├── CoinListItemCard.tsx# Mobilde kullanılan büyük dokunmatik kart bileşeni
│   │   ├── CoinListItemRow.tsx # Masaüstü için tablo satırı bileşeni
│   │   └── CoinListContainer.tsx # Virtualized (React Window) performanslı kapsayıcı
│   └── EmptyState/             # Arama/filtre sonucu boş kaldığında veya yüklenirken
├── App.tsx                     # Ana uygulama bileşeni
├── main.tsx                    # React DOM başlangıç noktası
└── index.css                   # Tailwind CSS yapılandırması
```

---

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js**: v18.0.0 veya üzeri
- **npm** / **yarn** / **pnpm**

### Adımlar

1. Bağımlılıkları yükleyin:
   ```bash
   npm install
   ```

2. Geliştirme sunucusunu başlatın:
   ```bash
   npm run dev
   ```
   Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

3. Üretim sürümünü derleyin:
   ```bash
   npm run build
   ```

4. Üretim önizlemesi yapın:
   ```bash
   npm run preview
   ```

---

## ⚡ Performans ve Mimari Detaylar

### 1. 250ms Batching & Throttling
Binance saniyede yüzlerce ticker güncellemesi gönderir. Her gelen pakette doğrudan React state'ini güncellemek tarayıcıyı kilitler. Bu sorunu önlemek için:
- Gelen paketler bellek içi bir kuyrukta (`queue`) toplanır.
- `setInterval` ile **250ms periyotlarla** toplu olarak (`updateTickersBatch`) Zustand store'a aktarılır.
- Dairesel tampon güncellemeleri sembol başına saniyede en fazla 1 kayıt ile sınırlandırılır.

### 2. Rolling Window Momentum Hesaplaması
- Her sembol için son 16 dakikalık fiyat ve hacim geçmişi (`history: PriceSnapshot[]`) tutulur.
- Seçilen zaman pencerelerine (`1m`, `5m`, `15m`) göre `now - windowMs` anındaki en yakın geçmiş fiyat bulunur.
- Yüzde değişim formülü: `((Anlık Fiyat - Geçmiş Fiyat) / Geçmiş Fiyat) * 100` şeklinde tam hareketli pencere olarak hesaplanır.

### 3. Sanallaştırma (List Virtualization)
- 300'den fazla parite aynı anda ekranda oluşturulduğunda DOM yükü artar.
- `react-window` kütüphanesi ile yalnızca ekranda görünen 8-12 adet kart DOM üzerinde tutulur, kaydırma esnasında dinamik olarak güncellenir.

---

## 📱 Mobil UX ve Erişilebilirlik

- **Touch Target Standardı:** Mobil cihazlarda tüm butonlar ve favori yıldızları en az **44x44 piksel** dokunma alanına sahiptir.
- **Karanlık Tema Varsayılan:** Gece ve kripto ekranı kullanımlarına uygun düşük göz yorgunluğu sağlayan Slate/Emerald/Rose renk paleti kullanılmıştır.
- **Bottom Sheet Drawer:** Mobilde filtre paneli ve ayarlar alttan yukarı kayan duyarlı (responsive) çekmece olarak açılır.

---

## 📜 Lisans

Apache-2.0 Lisansı ile korunmaktadır.
