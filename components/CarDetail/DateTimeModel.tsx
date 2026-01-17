import DateTimePickerModal from '@react-native-community/datetimepicker';
import dayjs, { Dayjs } from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Platform, StatusBar, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker, { DateType } from "react-native-ui-datepicker";
import { bookingService } from '../../services/booking.service';

dayjs.extend(isBetween);

interface DateTimeModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (range: { startDate: Date; endDate: Date, startTime: string, endTime: string }) => void;
  carId: string;
}

const DateTimeModal: React.FC<DateTimeModalProps> = ({
  visible,
  onClose,
  onConfirm,
  carId,
}) => {
  const [range, setRange] = useState<{
    startDate: Dayjs | null;
    endDate: Dayjs | null;
  }>({
    startDate: dayjs(),
    endDate: dayjs().add(1, "day"),
  });

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("none");
  const [customEndTime, setCustomEndTime] = useState<Dayjs | null>(null);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [bookedRanges, setBookedRanges] = useState<{ startDate: string; endDate: string }[]>([]);

  useEffect(() => {
    if (visible && carId) {
      fetchBookedDates();
    }
  }, [visible, carId]);

  const fetchBookedDates = async () => {
    try {
      const response = await bookingService.getBookedDates(carId);
      if (response && response.data) {
        setBookedRanges(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch booked dates", error);
    }
  };

  const isDateDisabled = (date: Dayjs) => {
    if (!bookedRanges.length) return false;

    // Check if the date falls within any booked range (inclusive)
    // We check for "day" overlap.
    return bookedRanges.some(range => {
      const start = dayjs(range.startDate);
      const end = dayjs(range.endDate);
      return date.isBetween(start, end, 'day', '[]');
    });
  };

  const handleChange = (params: {
    startDate?: DateType;
    endDate?: DateType;
  }) => {
    const newStartDate = params.startDate ? dayjs(params.startDate) : range.startDate;
    const newEndDate = params.endDate ? dayjs(params.endDate) : range.endDate;

    setRange({
      startDate: newStartDate,
      endDate: newEndDate,
    });

    // Calculate end time based on selected time slot
    if (newStartDate && newEndDate) {
      calculateEndTime(newStartDate, newEndDate, selectedTimeSlot);
    }
  };

  const calculateEndTime = (startDate: Dayjs, endDate: Dayjs, timeSlot: string) => {
    const daysDifference = endDate.diff(startDate, 'day');

    if (daysDifference === 0) {
      // Same day - use custom end time
      setCustomEndTime(endDate);
    } else {
      // Multiple days - calculate based on time slot
      let endTime: Dayjs;

      switch (timeSlot) {
        case "quarter":
          endTime = startDate.add(daysDifference, 'day').add(6, 'hour');
          break;
        case "half":
          endTime = startDate.add(daysDifference, 'day').add(12, 'hour');
          break;
        case "full":
          endTime = startDate.add(daysDifference, 'day');
          break;
        case "none":
        default:
          // No time slot selected - end time should be same as start time
          endTime = startDate.add(daysDifference, 'day').hour(startDate.hour()).minute(startDate.minute());
          break;
      }

      setCustomEndTime(endTime);
    }
  };

  const handleTimeSlotChange = (timeSlot: string) => {
    // Toggle selection - if already selected, deselect it
    const newTimeSlot = selectedTimeSlot === timeSlot ? "none" : timeSlot;
    setSelectedTimeSlot(newTimeSlot);
    if (range.startDate && range.endDate) {
      calculateEndTime(range.startDate, range.endDate, newTimeSlot);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime && range.startDate) {
      const newTime = dayjs(selectedTime);
      const newStartDate = range.startDate
        .hour(newTime.hour())
        .minute(newTime.minute())
        .second(0)
        .millisecond(0);

      setRange(prev => ({
        ...prev,
        startDate: newStartDate
      }));

      // Recalculate end time with the new start time
      if (range.endDate) {
        calculateEndTime(newStartDate, range.endDate, selectedTimeSlot);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent>
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" barStyle="light-content" />
      <TouchableOpacity
        className="flex-1 bg-black/50 justify-end"
        style={{ paddingTop: 0, marginTop: 0 }}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          className="bg-white rounded-t-2xl p-4 bg-background"
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close button */}


          <Text className="text-lg font-semibold mb-2 text-center">
            Select Date Range & Time
          </Text>

          {/* Selected Time Range Display */}
          {range.startDate && range.endDate && (
            <View className="bg-orange-50 rounded-lg p-3 mb-4 mx-2">
              <Text className="text-center text-orange-700 font-medium">
                Selected: {range.startDate.format("MMM D, YYYY HH:mm")} - {customEndTime?.format("MMM D, YYYY HH:mm") || range.endDate.format("MMM D, YYYY HH:mm")}
              </Text>
              {range.endDate.diff(range.startDate, 'day') < 1 && (
                <Text className="text-center text-red-600 text-sm mt-1">
                  Minimum booking duration is 1 day
                </Text>
              )}
            </View>
          )}

          {/* Date & Time Picker */}
          <DateTimePicker
            mode="range"
            showOutsideDays
            navigationPosition="around"
            startDate={range.startDate?.toDate()}
            endDate={range.endDate?.toDate()}
            onChange={handleChange}
            timePicker={false} // We handle time separately with DateTimePickerModal and custom logic
            minDate={dayjs().toDate()}
            maxDate={dayjs().add(3, "month").toDate()}
            disabledDates={(date) => isDateDisabled(dayjs(date))}
            classNames={{
              // Base selected day styling
              selected: "bg-orange-500 border-orange-500 rounded-full text-white",
              selected_label: "text-white font-semibold",

              // Range styling - using only valid classNames
              range_start: "bg-orange-500 text-white rounded-full border-2 border-orange-500",
              range_end: "bg-orange-500 text-white rounded-full border-2 border-orange-500",

              // Range fill styling
              range_fill: "bg-orange-100",
              range_fill_weekstart: "bg-orange-100",
              range_fill_weekend: "bg-orange-100",

              // General day styling
              day: "hover:bg-orange-100 text-gray-700",
              day_label: "text-gray-700",

              // Disabled days
              disabled: "opacity-50 text-gray-400",
              disabled_label: "text-gray-400",

              // Navigation buttons
              button_prev: "bg-orange-500 w-10 h-10 rounded-full items-center justify-center",
              button_next: "bg-orange-500 w-10 h-10 rounded-full items-center justify-center",

              // Month/Year labels
              month_label: "text-gray-800 font-semibold",
              year_label: "text-gray-800 font-semibold",
            }}
          />

          {/* Start Time Selector */}
          {range.startDate && (
            <View className="mt-4">
              <Text className="text-lg font-semibold mb-3 text-center text-gray-800">
                Select Start Time
              </Text>

              <View className="flex-row justify-center">
                <TouchableOpacity
                  className="bg-white border-2 border-gray-300 rounded-lg px-4 py-3 flex-row items-center"
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text className="text-gray-700 font-medium mr-2">
                    {range.startDate.format("HH:mm")}
                  </Text>
                  <Text className="text-orange-500">✏️</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Time Picker Modal */}
          {showTimePicker && (
            <DateTimePickerModal
              value={range.startDate?.toDate() || new Date()}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          {/* Time Slot Selection */}
          {range.startDate && range.endDate && range.endDate.diff(range.startDate, 'day') > 0 && (
            <View className="mt-4">
              <Text className="text-lg font-semibold mb-3 text-center text-gray-800">
                Select Return Time
              </Text>

              <View className="flex-row justify-between gap-2">


                <TouchableOpacity
                  className={`flex-1 py-3 px-4 rounded-lg border-2 ${selectedTimeSlot === "half"
                    ? "bg-orange-500 border-orange-500"
                    : "bg-white border-gray-300"
                    }`}
                  onPress={() => handleTimeSlotChange("half")}
                >
                  <Text className={`text-center font-medium ${selectedTimeSlot === "half" ? "text-white" : "text-gray-700"
                    }`}>
                    Half Day
                  </Text>
                  <Text className={`text-center text-xs mt-1 ${selectedTimeSlot === "half" ? "text-orange-100" : "text-gray-500"
                    }`}>
                    +12 hours
                  </Text>
                </TouchableOpacity>


              </View>
            </View>
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
              className={`flex-1 ml-2 py-3 rounded-xl items-center ${range.startDate && range.endDate && range.endDate.diff(range.startDate, 'day') >= 1
                ? "bg-orange-500"
                : "bg-gray-300"
                }`}
              disabled={!range.startDate || !range.endDate || range.endDate.diff(range.startDate, 'day') < 1}
              onPress={() => {
                if (range.startDate && range.endDate && range.endDate.diff(range.startDate, 'day') >= 1) {
                  const finalEndDate = customEndTime || range.endDate;

                  // Validation: Check for overlap with booked ranges
                  // We need precise time comparison here using the full timestamps (range.startDate with time, finalEndDate with time)
                  // range.startDate (Dayjs) has the time set if user edited it.
                  // finalEndDate (Dayjs) has the time set.

                  const selectedStart = range.startDate;
                  const selectedEnd = finalEndDate;

                  const hasOverlap = bookedRanges.some(booked => {
                    const bookedStart = dayjs(booked.startDate);
                    const bookedEnd = dayjs(booked.endDate);

                    // Overlap logic:
                    // (SelectedStart < BookedEnd) AND (SelectedEnd > BookedStart)
                    return selectedStart.isBefore(bookedEnd) && selectedEnd.isAfter(bookedStart);
                  });

                  if (hasOverlap) {
                    Alert.alert(
                      "Unavailable",
                      "This car is already booked during the selected time.",
                      [{ text: "OK" }]
                    );
                    return;
                  }

                  onConfirm({
                    startDate: range.startDate.toDate(),
                    endDate: finalEndDate.toDate(),
                    startTime: range.startDate.format('HH:mm'),
                    endTime: finalEndDate.format('HH:mm'),
                  });
                }
                onClose();
              }}
            >
              <Text className="text-white font-medium">Confirm</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DateTimeModal;
