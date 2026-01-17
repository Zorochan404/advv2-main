export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/v2/login',
        REGISTER: '/auth/v2/register',
        ME: '/auth/me',
    },
    USER: {
        PROFILE: '/user/profile',
        UPDATE: '/user/updateuser',
        GET_USER: '/user/getuser',
    },
    BOOKING: {
        SUMMARY: '/booking/summary/:carid',
        APPLY_COUPON: '/booking/summary/apply-coupon/:carid',
        GET_BOOKED_DATES: '/booking/car/:id/booked-dates',
        CREATE: '/booking/',
        MY_BOOKINGS: '/booking/my-bookings',
        GET_DETAIL: '/booking/detail/:id',
        UPLOAD_IMAGES: '/booking/:bookingId/upload-images',
        FINAL_PAYMENT: '/booking/final-payment',
        APPLY_TOPUP: '/booking/apply-topup',
    },
    CARS: {
        NEAREST_AVAILABLE: '/cars/nearestavailablecars'
    }
    // Add other feature endpoints here
} as const;
