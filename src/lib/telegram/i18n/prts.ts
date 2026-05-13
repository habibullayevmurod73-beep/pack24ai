// ─── PRTS (Personal Recycle Track System) matnlari ───────────────────────────
import type { Lang } from './index';

type Texts = Record<string, Record<Lang, string>>;

export const prtsTexts: Texts = {
    btn_prts: { uz: '🌿 PRTS Ballarim', ru: '🌿 Мои PRTS баллы', en: '🌿 My PRTS Points' },
    cabinet_btn_prts: { uz: '🌿 PRTS Dashboard', ru: '🌿 PRTS Панель', en: '🌿 PRTS Dashboard' },
    prts_info: {
        uz: '🌿 <b>PRTS — Personal Recycle Track System</b>\n\n♻️ PRTS — bu chiqindilarni qayta ishlashga topshirish va buning evaziga mukofotlar olish platformasi.\n\n<b>Qanday ishlaydi?</b>\n\n1️⃣ Siz makulatura, plastmassa, shisha, bakalashka kabi chiqindilarni yig\'ishga buyurtma berasiz\n2️⃣ Haydovchi kelib chiqindini olib ketadi\n3️⃣ Har bir kg uchun <b>PRTS ballar</b> olasiz\n4️⃣ Ballarni pul yoki boshqa mukofotlarga almashtirasiz!\n\n📦 <b>Qabul qilinadigan chiqindilar:</b>\n• 📄 Makulatura (gazeta, kitob, karton)\n• 🧴 Plastmassa (butilka, idish)\n• 🍶 Shisha (bankalar, butilkalar)\n• 🥫 Metal (konservalar, banalar)\n• 💻 Elektronika (eski texnika)\n\n💰 <b>Mukofotlar:</b>\n• ☕ 150 ball → Kofe 50% chegirma\n• 🚌 300 ball → Bepul transport\n• 🎬 500 ball → Kino chipta\n• 🌳 1000 ball → Daraxt ekish\n\n🌍 Har bir kg chiqindi — tabiat uchun katta yordam!\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 <b>pack24.ai/prts</b> — Veb dashboard',
        ru: '🌿 <b>PRTS — Personal Recycle Track System</b>\n\n♻️ PRTS — это платформа для сдачи отходов на переработку и получения наград.\n\n<b>Как это работает?</b>\n\n1️⃣ Вы заказываете вывоз макулатуры, пластика, стекла, бутылок и др.\n2️⃣ Водитель приезжает и забирает отходы\n3️⃣ За каждый кг вы получаете <b>PRTS баллы</b>\n4️⃣ Баллы обмениваются на деньги или подарки!\n\n📦 <b>Принимаемые отходы:</b>\n• 📄 Макулатура (газеты, книги, картон)\n• 🧴 Пластик (бутылки, тара)\n• 🍶 Стекло (банки, бутылки)\n• 🥫 Металл (консервы, банки)\n• 💻 Электроника (старая техника)\n\n💰 <b>Награды:</b>\n• ☕ 150 баллов → 50% скидка на кофе\n• 🚌 300 баллов → Бесплатный проезд\n• 🎬 500 баллов → Билет в кино\n• 🌳 1000 баллов → Посадка дерева\n\n🌍 Каждый кг отходов — большая помощь природе!\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 <b>pack24.ai/prts</b> — Веб панель',
        en: '🌿 <b>PRTS — Personal Recycle Track System</b>\n\n♻️ PRTS is a platform for recycling waste and earning rewards in return.\n\n<b>How does it work?</b>\n\n1️⃣ You order a pickup for paper, plastic, glass, bottles, etc.\n2️⃣ A driver comes and collects your waste\n3️⃣ You earn <b>PRTS points</b> for every kg\n4️⃣ Exchange points for cash or rewards!\n\n📦 <b>Accepted waste:</b>\n• 📄 Paper (newspapers, books, cardboard)\n• 🧴 Plastic (bottles, containers)\n• 🍶 Glass (jars, bottles)\n• 🥫 Metal (cans, tins)\n• 💻 Electronics (old devices)\n\n💰 <b>Rewards:</b>\n• ☕ 150 pts → 50% coffee discount\n• 🚌 300 pts → Free transport pass\n• 🎬 500 pts → Cinema ticket\n• 🌳 1000 pts → Plant a tree\n\n🌍 Every kg of waste helps nature!\n\n━━━━━━━━━━━━━━━━━━━━\n🔗 <b>pack24.ai/prts</b> — Web dashboard',
    },
    prts_dashboard: {
        uz: '📊 <b>Sizning PRTS hisobingiz</b>\n\n👤 {name}\n\n♻️ Qayta ishlangan: <b>{weight} kg</b>\n🌍 CO₂ tejaldi: <b>{co2} kg</b>\n🌳 Daraxtlar saqlandi: <b>{trees} ta</b>\n💧 Suv tejaldi: <b>{water} L</b>\n\n🏆 <b>PRTS ballaringiz: {points}</b>',
        ru: '📊 <b>Ваш PRTS аккаунт</b>\n\n👤 {name}\n\n♻️ Переработано: <b>{weight} кг</b>\n🌍 CO₂ сэкономлено: <b>{co2} кг</b>\n🌳 Деревьев спасено: <b>{trees} шт.</b>\n💧 Воды сэкономлено: <b>{water} л</b>\n\n🏆 <b>Ваши PRTS баллы: {points}</b>',
        en: '📊 <b>Your PRTS Account</b>\n\n👤 {name}\n\n♻️ Recycled: <b>{weight} kg</b>\n🌍 CO₂ saved: <b>{co2} kg</b>\n🌳 Trees saved: <b>{trees}</b>\n💧 Water saved: <b>{water} L</b>\n\n🏆 <b>Your PRTS points: {points}</b>',
    },
    prts_rewards_list: {
        uz: '🎁 <b>Mukofotlar</b>\n\nSizning ballaringiz: <b>{points} PRTS</b>\n\n☕ Kofe 50% chegirma — <b>150 ball</b>\n🚌 Bepul transport — <b>300 ball</b>\n🎬 Kino chipta — <b>500 ball</b>\n🌳 Daraxt ekish — <b>1000 ball</b>\n\nAlmashtirish uchun tanlang 👇',
        ru: '🎁 <b>Награды</b>\n\nВаши баллы: <b>{points} PRTS</b>\n\n☕ 50% скидка на кофе — <b>150 баллов</b>\n🚌 Бесплатный проезд — <b>300 баллов</b>\n🎬 Билет в кино — <b>500 баллов</b>\n🌳 Посадка дерева — <b>1000 баллов</b>\n\nВыберите для обмена 👇',
        en: '🎁 <b>Rewards</b>\n\nYour points: <b>{points} PRTS</b>\n\n☕ 50% coffee discount — <b>150 pts</b>\n🚌 Free transport — <b>300 pts</b>\n🎬 Cinema ticket — <b>500 pts</b>\n🌳 Plant a tree — <b>1000 pts</b>\n\nSelect to redeem 👇',
    },
    prts_reward_success: {
        uz: '🎉 <b>Tabriklaymiz!</b>\n\n{reward} muvaffaqiyatli almashtirildi!\n\n💰 Sarflandi: <b>{spent} ball</b>\n📊 Qoldiq: <b>{remaining} ball</b>',
        ru: '🎉 <b>Поздравляем!</b>\n\n{reward} успешно получена!\n\n💰 Потрачено: <b>{spent} баллов</b>\n📊 Остаток: <b>{remaining} баллов</b>',
        en: '🎉 <b>Congratulations!</b>\n\n{reward} successfully redeemed!\n\n💰 Spent: <b>{spent} pts</b>\n📊 Remaining: <b>{remaining} pts</b>',
    },
    prts_insufficient: {
        uz: '❌ <b>Ball yetarli emas!</b>\n\nKerakli: {required} ball\nSizda: {current} ball\nYetishmaydi: {diff} ball\n\n♻️ Ko\'proq makulatura topshiring va ball to\'plang!',
        ru: '❌ <b>Недостаточно баллов!</b>\n\nНеобходимо: {required} баллов\nУ вас: {current} баллов\nНе хватает: {diff} баллов\n\n♻️ Сдавайте больше макулатуры и копите баллы!',
        en: '❌ <b>Insufficient points!</b>\n\nRequired: {required} pts\nYou have: {current} pts\nNeed: {diff} more\n\n♻️ Recycle more to earn points!',
    },
};
