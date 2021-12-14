# Unofficial BMKG REST Client / Scraper

## Tentang

Client ini mengambil data dari API BMKG yang bersumber dari aplikasi resminya, dan mengubahnya menjadi REST API yang diharapkan memudahkan developer untuk memanipulasi data yang terkandung di dalamnya.

## Mengapa

* Mengambil data dari situs resmi kurang reliabel, sebab layoutnya dapat berubah sewaktu-waktu.
* Beberapa endpoint tercantum di laman [Data Terbuka BMKG](https://data.bmkg.go.id/tentang/) tidak dapat diakses.

## Fitur yang Didukung

Saat ini fitur yang didukung hanyalah mengambil data cuaca (rata-rata harian serta prakiraan) dari sebuah kecamatan tertentu.

## Endpoint

Respons diberikan dalam format JSON object. Object ini mengandung key `links` yang mengarah pada alamat-alamat yang memiliki relasi dengan object ini, serta pada alamat sumber data. Setiap link mendeskripsikan relasi dan berisi URL, method serta parameter yang dibutuhkan.

* `/` - Semacam "halaman utama" untuk REST API
* `/kecamatan` - Menampilkan data kecamatan untuk sebuah kabupaten atau kota. Untuk menggunakan endpoint ini **harus** mencantumkan nama kab/kota tersebut dalam parameter `kabupaten`. Contohnya untuk mengambil kecamatan di kota Depok (Jawa Barat) menggunakan URL `/kecamatan?kabupaten=Kota%20Depok`. Untuk sekarang nama ini harus sesuai dengan yang terdaftar di API BMKG (termasuk huruf kapital dan spasi).
* `/kecamatan/{id}/` - Menampilkan informasi tentang sebuah kecamatan: lintang, bujur, kabupaten/kota, provinsi.
* `/kecamatan/{id}/weather` - Menampilkan informasi cuaca untuk kecamatan yang terkait.

## Menjalankan server

Pastikan node.js dan NPM telah terpasang di sistem Anda.

Kemudian jalankan perintah berikut:

```
npm install --only=prod
npm start
```

Secara default, endpoint akan dapat diakses di `localhost:4000`.

## Lisensi

MIT dengan ketentuan tambahan sesuai arahan [Data Terbuka BMKG](https://data.bmkg.go.id/tentang/):

> Kami **mewajibkan** bagi pihak yang menggunakan dan memanfaatkan Data Terbuka BMKG ini
> untuk mencamtumkan BMKG (Badan Meteorologi, Klimatologi, dan Geofisika) sebagai
> **sumber data** dan menampilkannya pada aplikasi/sistem.
