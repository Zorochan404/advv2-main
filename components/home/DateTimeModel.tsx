import DateTimePickerModal from '@react-native-community/datetimepicker';
import dayjs, { Dayjs } from "dayjs";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";

interface DateTimeModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: { date: Date, time: string }) => void;
    isEnd?: boolean;
}

const DateTimeModal: React.FC<DateTimeModalProps> = ({
    visible,
    onClose,
    onConfirm,
    isEnd = false,
}) => {
    const [date, setDate] = useState<Dayjs>(dayjs());
    const [time, setTime] = useState<Date>(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    const handleChange = (params: { date: DateType }) => {
        if (params.date) {
            setDate(dayjs(params.date));
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-2xl p-4 bg-background">
                    <Text className="text-lg font-semibold mb-4 text-center">
                        {isEnd ? "Select End Date & Time" : "Select Start Date & Time"}
                    </Text>

                    {/* Date & Time Picker */}
                    <DateTimePicker
                        mode="single"
                        showOutsideDays={true}
                        navigationPosition="around"
                        date={date}
                        onChange={handleChange}
                        minDate={isEnd ? dayjs().add(1, "day") : dayjs()}
                        classNames={{
                            today: "border-orange-500 rounded-xl",
                            selected: "bg-orange-500 border-amber-500 rounded-xl",
                            selected_label: "text-white",
                            day: `hover:bg-amber-100`,
                            disabled: "opacity-50",
                            button_prev: "bg-orange-500 w-10 rounded-full",
                            button_next:
                                "bg-orange-500 w-10 rounded-full justify-center items-end",
                        }}
                    />

                    {/* Time Selector */}
                    <View className="mt-4">
                        <Text className="text-gray-700 font-semibold mb-2">Select Time</Text>
                        <TouchableOpacity
                            className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3"
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text className="text-black text-center">
                                {dayjs(time).format("HH:mm")}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {showTimePicker && (
                        <DateTimePickerModal
                            value={time}
                            mode="time"
                            is24Hour={true}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedTime) => {
                                setShowTimePicker(false);
                                if (selectedTime) {
                                    setTime(selectedTime);
                                }
                            }}
                        />
                    )}

                    {/* Buttons */}
                    <View className="flex-row justify-between mt-4">
                        <TouchableOpacity
                            className="flex-1 mr-2 py-3 bg-gray-200 rounded-xl items-center"
                            onPress={onClose}
                        >
                            <Text className="text-gray-700 font-medium">Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 ml-2 py-3 bg-orange-500 rounded-xl items-center"
                            onPress={() => {
                                onConfirm({
                                    date: date.toDate(),
                                    time: dayjs(time).format("HH:mm")
                                });
                                onClose();
                            }}
                        >
                            <Text className="text-white font-medium">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DateTimeModal;
