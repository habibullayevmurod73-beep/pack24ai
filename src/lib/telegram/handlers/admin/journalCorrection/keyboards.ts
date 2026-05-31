export function entityKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '📥 Qabul', callback_data: 'cent_i' },
                { text: '🏭 Press', callback_data: 'cent_p' },
            ],
            [
                { text: '💸 Xarajat', callback_data: 'cent_e' },
                { text: '💼 Kassa', callback_data: 'cent_c' },
            ],
            [{ text: '🚛 Sotuv', callback_data: 'cent_s' }],
        ],
    };
}

export function correctionFilterDayKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '📅 Bugun', callback_data: 'cbf_t' },
                { text: '📅 Kecha', callback_data: 'cbf_y' },
            ],
            [{ text: '✏️ Qo\'lda sana', callback_data: 'cbf_m' }],
        ],
    };
}

export function correctionNewDateKeyboard() {
    return {
        inline_keyboard: [
            [
                { text: '📅 Bugun', callback_data: 'cnd_t' },
                { text: '📅 Kecha', callback_data: 'cnd_y' },
            ],
            [{ text: '✏️ Qo\'lda sana', callback_data: 'cnd_m' }],
        ],
    };
}
