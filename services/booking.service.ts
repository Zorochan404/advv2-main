import { apiClient } from "./api/client";
import { ENDPOINTS } from "./api/endpoints";

export interface BookingSummaryRequest {
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
}

export interface ApplyCouponRequest extends BookingSummaryRequest {
    couponCode: string;
}

export interface PaymentSummary {
    rentalCost: number;
    insurance: number;
    discount: number;
    toBePaidNow: number;
    toBePaidAtPickup: number;
    totalPayment: number;
}

export interface Voucher {
    id: number;
    code: string;
    title: string;
    description: string;
    discountAmount: number;
    minBookingAmount: string;
    discountType: string;
    discountValue: string;
}

export interface BookingSummaryData {
    paymentSummary: PaymentSummary;
    vouchers: Voucher[];
}

export interface BookingSummaryResponse {
    success: boolean;
    message: string;
    data: BookingSummaryData;
    statusCode: number;
}

export interface BookingApplyCouponResponse {
    success: boolean;
    message: string;
    data: {
        paymentSummary: PaymentSummary;
        appliedCoupon: {
            code: string;
            discountAmount: number;
        };
    };
    statusCode: number;
}

export const bookingService = {
    getBookingSummary: async (carId: string, payload: BookingSummaryRequest) => {
        const url = ENDPOINTS.BOOKING.SUMMARY.replace(':carid', carId);
        console.log(url)
        const response = await apiClient.post<BookingSummaryResponse>(url, payload);
        console.log(response)
        return response.data;
    },
    applyCoupon: async (carId: string, payload: ApplyCouponRequest) => {
        const url = ENDPOINTS.BOOKING.APPLY_COUPON.replace(':carid', carId);
        const response = await apiClient.post<BookingApplyCouponResponse>(url, payload);
        return response.data;
    },
    getBookedDates: async (carId: string) => {
        const url = ENDPOINTS.BOOKING.GET_BOOKED_DATES.replace(':id', carId);
        const response = await apiClient.get<{ data: { startDate: string; endDate: string }[] }>(url);
        return response.data;
    },
    createBooking: async (payload: CreateBookingRequest) => {
        const url = ENDPOINTS.BOOKING.CREATE;
        const response = await apiClient.post<CreateBookingResponse>(url, payload);
        return response.data;
    },
    getMyBookings: async () => {
        const url = ENDPOINTS.BOOKING.MY_BOOKINGS;
        const response = await apiClient.get<MyBookingsResponse>(url);
        return response.data;
    },
    getBookingDetail: async (id: string | number) => {
        const url = ENDPOINTS.BOOKING.GET_DETAIL.replace(':id', id.toString());
        const response = await apiClient.get<BookingDetailResponse>(url);
        return response.data;
    },
    uploadBookingImages: async (bookingId: string | number, payload: UploadImagesPayload) => {
        const url = ENDPOINTS.BOOKING.UPLOAD_IMAGES.replace(':bookingId', bookingId.toString());
        const response = await apiClient.post(url, payload);
        return response.data;
    },
    makeFinalPayment: async (payload: FinalPaymentPayload) => {
        const response = await apiClient.post(ENDPOINTS.BOOKING.FINAL_PAYMENT, payload);
        return response.data;
    },
    applyTopup: async (payload: ApplyTopupPayload) => {
        const response = await apiClient.post(ENDPOINTS.BOOKING.APPLY_TOPUP, payload);
        return response.data;
    }
};

export interface ApplyTopupPayload {
    bookingId: number;
    extensionTime: number; /* In hours */
    paymentReferenceId: string;
}

export interface FinalPaymentPayload {
    bookingId: number;
    paymentReferenceId: string;
}

export interface UploadImagesPayload {
    carConditionImages?: string[];
    toolImages?: string[];
}

export interface BookingDetailResponse {
    success: boolean;
    message: string;
    data: {
        booking: Booking & {
            rescheduleCount: number;
            maxRescheduleCount: number;
            basePrice: number;
            advanceAmount: number;
            remainingAmount: number;
            totalPrice: number;
            discountAmount: number;
            insuranceAmount: number;
            extensionPrice: number;
            extensionTill: string | null;
            extensionTime: string | null;
            returnCondition: string;
            returnImages: string[];
            returnComments: string | null;
            status: string;
            confirmationStatus: string;
            advancePaymentId: number | null;
            finalPaymentId: number | null;
            carConditionImages: string[];
            toolImages: string[];
            tools: string[];
            picApproved: boolean;
            picApprovedAt: string | null;
            picApprovedBy: string | null;
            picComments: string | null;
            otpCode: string | null;
            otpExpiresAt: string | null;
            otpVerified: boolean;
            otpVerifiedAt: string | null;
            otpVerifiedBy: string | null;
            userConfirmed: boolean;
            userConfirmedAt: string | null;
            pickupParkingId: number;
            dropoffParkingId: number;
            deliveryType: string;
            deliveryAddress: string | null;
            deliveryCharges: number;
            createdAt: string;
            updatedAt: string;
            statusSummary: {
                overallStatus: string;
                confirmationStatus: string;
                advancePaymentStatus: string;
                finalPaymentStatus: string;
                progress: {
                    advancePayment: boolean;
                    otpVerification: boolean;
                    userConfirmation: boolean;
                    picApproval: boolean;
                    finalPayment: boolean;
                    carPickup: boolean;
                    carReturn: boolean;
                };
                nextSteps: string[];
                currentStep: string;
                isCompleted: boolean;
                canProceed: boolean;
                statusMessages: string[];
            };
            billingBreakdown: {
                basePrice: number;
                insuranceAmount: number;
                deliveryCharges: number;
                discountAmount: number;
                totalBeforeDiscount: number;
                totalPrice: number;
                advanceAmount: number;
                remainingAmount: number;
            };
            vendor?: any;
            parking?: any;
            catalog?: any;
            car: {
                extensionperhour: number;
                halfdayprice: number;
                rcnumber: string;
                rcimg: string;
                pollutionimg: string;
                insuranceimg: string;
                price: number;
                discountprice: number;
            }
            pickupParking: {
                id: number;
                name: string;
                locality: string;
                city: string;
                state?: string;
            } | null;
            dropoffParking: {
                id: number;
                name: string;
                locality: string;
                city: string;
                state?: string;
            } | null;
        }
    };
    statusCode: number;
}

export interface MyBookingsResponse {
    success: boolean;
    message: string;
    data: {
        allBookings: Booking[];
        groupedBookings: {
            active: Booking[];
            completed: Booking[];
            cancelled: Booking[];
        };
        summary: {
            total: number;
            active: number;
            completed: number;
            cancelled: number;
        };
    };
    statusCode: number;
}

export interface Booking {
    id: number;
    startDate: string;
    endDate: string;
    status: string;
    car: {
        id: number;
        name: string;
        images: string[];
        number?: string;
        color?: string;
    };
    pickupParking: {
        id: number;
        name: string;
        locality: string;
        city: string;
        state?: string;
    } | null;
    dropoffParking: {
        id: number;
        name: string;
        locality: string;
        city: string;
        state?: string;
    } | null;
}

export interface CreateBookingRequest {
    carId: number | string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    couponCode?: string;
}

export interface CreateBookingResponse {
    success: boolean;
    message: string;
    data: any; // Use specific type if known, e.g. Booking object
}
