# คู่มือการติดตั้ง Firebase Realtime Database และนำขึ้นใช้งาน (Deploy) ฟรี 100%

คู่มือนี้สำหรับใช้งานร่วมกับโค้ด 2 ไฟล์ที่แยกให้:
1. `survey.html` (หน้าแบบสอบถามสำหรับผู้เข้าอบรมตอบผ่านมือถือ)
2. `dashboard.html` (หน้าแดชบอร์ดสรุปผลแบบเรียลไทม์ขึ้นจอโปรเจกเตอร์)

---

## ขั้นตอนที่ 1: สร้างโปรเจกต์ Firebase (ฟรี Spark Plan)

1. เข้าเว็บไซต์ [https://console.firebase.google.com/](https://console.firebase.google.com/) ล็อกอินด้วยบัญชี Google
2. กดปุ่ม **"Add project"** หรือ **"สร้างโปรเจกต์"**
3. ตั้งชื่อโปรเจกต์ เช่น `training-feedback-app` แล้วกด Continue
4. ส่วน Google Analytics สามารถกดปิดหรือเปิดตามสะดวก แล้วกด **"Create project"**
5. รอระบบสร้างโปรเจกต์ประมาณ 20 วินาที เมื่อเสร็จแล้วกด **"Continue"**

---

## ขั้นตอนที่ 2: สร้าง Firebase Realtime Database

1. ที่เมนูด้านซ้าย เลือก **Build** -> **Realtime Database**
2. กดปุ่ม **"Create Database"**
3. เลือกตำแหน่งเซิร์ฟเวอร์ (แนะนำเลือก `Singapore (asia-southeast1)` เพื่อความเร็วสูงสุดในไทย) กด Next
4. ในขั้นตอน Security rules ให้เลือก **"Start in test mode"** ชั่วคราว แล้วกด **"Enable"**
5. ไปที่แท็บ **Rules** ด้านบน แล้วแก้ไขกฎความปลอดภัยให้อ่านและเขียนได้:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
6. กดปุ่ม **"Publish"** เพื่อบันทึกกฎ

---

## ขั้นตอนที่ 3: รับค่าการเชื่อมต่อ (Firebase Config)

1. กดที่ไอคอนรูปเฟือง **Project settings** (การตั้งค่าโปรเจกต์) ที่มุมซ้ายบน
2. เลื่อนลงมาด้านล่างสุดที่หัวข้อ **"Your apps"**
3. คลิกที่ไอคอนเว็บ **`</>` (Web)**
4. ตั้งชื่อ App เช่น `training-web` แล้วกด **"Register app"**
5. ระบบจะแสดงโค้ด `firebaseConfig` ให้คัดลอกส่วนที่เป็น object เช่น:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD-xxxxxxxxxxxxxxxxxxxx",
     authDomain: "training-feedback-app.firebaseapp.com",
     databaseURL: "https://training-feedback-app-asia-southeast1.firebasedatabase.app",
     projectId: "training-feedback-app",
     storageBucket: "training-feedback-app.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```
6. นำชุดตัวเลข/ข้อความนี้ไปวางแทนที่ `firebaseConfig` ในทั้ง 2 ไฟล์:
   - ในไฟล์ `survey.html` (ประมาณบรรทัด 235)
   - ในไฟล์ `dashboard.html` (ประมาณบรรทัด 180)

---

## ขั้นตอนที่ 4: นำขึ้นใช้งานออนไลน์ (Deploy) ได้ฟรี 3 ช่องทาง

### วิธีที่ ก: อัปโหลดผ่าน GitHub Pages (ง่ายที่สุด ไม่ต้องลงโปรแกรม)
1. ไปที่ [GitHub.com](https://github.com) สร้าง Repository ใหม่ เช่น `training-survey`
2. อัปโหลดทั้งไฟล์ `survey.html` และ `dashboard.html` (หรือเปลี่ยนชื่อ `survey.html` เป็น `index.html`)
3. ไปที่แท็บ **Settings** -> **Pages**
4. ในส่วน Branch เลือก `main` แล้วกด Save
5. ท่านจะได้ URL เช่น `https://username.github.io/training-survey/survey.html` และ `dashboard.html` สามารถใช้งานได้ทันที

### วิธีที่ ข: อัปโหลดผ่าน Netlify Drop (ลากวางได้ทันที)
1. รวมไฟล์ `survey.html` และ `dashboard.html` ไว้ในโฟลเดอร์เดียวกัน
2. เข้าไปที่ [https://app.netlify.com/drop](https://app.netlify.com/drop)
3. ลากโฟลเดอร์ไปวาง ระบบจะสร้าง URL ให้ออนไลน์ทันทีภายใน 10 วินาที

### วิธีที่ ค: นำขึ้น Firebase Hosting (มาตรฐานทางการ)
1. ติดตั้ง Firebase CLI ในคอมพิวเตอร์: `npm install -g firebase-tools`
2. ล็อกอิน: `firebase login`
3. สั่งรัน: `firebase init hosting` เลือกโปรเจกต์ที่สร้างไว้
4. วางไฟล์ HTML ลงในโฟลเดอร์ `public`
5. สั่งดีพลอย: `firebase deploy --only hosting`

---

## จุดเด่นของสถาปัตยกรรมนี้
- **Zero Cost**: อยู่ในโควตาฟรีตลอดชีพของ Firebase Realtime Database (1 GB Storage, 10 GB/เดือน Data transfer, 100 simultaneous connections ซึ่งเพียงพอสำหรับคลาสหลักร้อยคน)
- **เรียลไทม์แท้ 100%**: ใช้ WebSocket protocol ของ Firebase ข้อมูลส่งถึงจอโปรเจกเตอร์ในเวลาน้อยกว่า 0.3 วินาที
- **ป้องกันการตอบซ้ำ**: มีการตรวจสอบ LocalStorage ของเบราว์เซอร์ผู้ตอบอัตโนมัติ
- **ดาวน์โหลดผลเป็น Excel ได้สมบูรณ์**: ไฟล์ CSV เข้ารหัส UTF-8 พร้อม BOM ภาษาไทยไม่เป็นภาษาต่างดาว
