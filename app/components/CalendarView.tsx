import { View, Text, Pressable } from 'react-native';
import { useMemo } from 'react';
import { Task, Priority } from '../types/task';
import { PRIORITIES } from '../constants/theme';

interface CalendarViewProps {
  tasks: Task[];
  onDateSelect: (date: Date) => void;
}

export default function CalendarView({ tasks, onDateSelect }: CalendarViewProps) {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      if (task.dueDate) {
        const date = new Date(task.dueDate).toDateString();
        if (!map.has(date)) map.set(date, []);
        map.get(date)?.push(task);
      }
    });
    return map;
  }, [tasks]);

  const getHighestPriority = (date: string): Priority | null => {
    const dateTasks = tasksByDate.get(date);
    if (!dateTasks?.length) return null;
    
    const priorities: Priority[] = ['high', 'medium', 'low'];
    return priorities.find(p => dateTasks.some(t => t.priority === p)) || null;
  };

  const weeks = useMemo(() => {
    const days = [];
    const startDay = firstDayOfMonth.getDay();
    
    // Add empty days for padding
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(today.getFullYear(), today.getMonth(), i));
    }
    
    // Split into weeks
    const weeks = [];
    while (days.length) {
      weeks.push(days.splice(0, 7));
    }
    
    return weeks;
  }, [today]);

  return (
    <View className="p-4">
      <View className="flex-row justify-between mb-4">
        <Text className="text-xl font-semibold">
          {today.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
      </View>
      
      <View className="flex-row justify-between mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} className="text-gray-500 text-center w-10">
            {day}
          </Text>
        ))}
      </View>
      
      {weeks.map((week, i) => (
        <View key={i} className="flex-row justify-between mb-2">
          {week.map((date, j) => {
            if (!date) return <View key={`empty-${j}`} className="w-10 h-10" />;
            
            const dateString = date.toDateString();
            const priority = getHighestPriority(dateString);
            const isToday = date.toDateString() === today.toDateString();
            
            return (
              <Pressable
                key={dateString}
                onPress={() => onDateSelect(date)}
                className={`w-10 h-10 rounded-full justify-center items-center
                  ${isToday ? 'bg-blue-100' : ''}`}
              >
                <View className="items-center">
                  <Text className={`${isToday ? 'font-bold' : ''}`}>
                    {date.getDate()}
                  </Text>
                  {priority && (
                    <View 
                      className="w-2 h-2 rounded-full mt-1"
                      style={{ backgroundColor: PRIORITIES[priority].color }}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
} 