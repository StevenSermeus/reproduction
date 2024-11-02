import { format, setYear } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
	value: string | undefined;
	onChange: (date: string | undefined) => void;
	maxDate?: Date;
	minDate?: Date;
}

export default function DatePickerWithYearSelection({
	maxDate,
	minDate,
	value,
	onChange,
}: DatePickerProps) {
	const [date, setDate] = React.useState(() =>
		value ? new Date(value) : new Date(),
	);
	const [isOpen, setIsOpen] = React.useState(false);

	const updateYear = (newYear: number) => {
		const newDate = setYear(date, newYear);
		setDate(newDate);
		if (value) {
			onChange(setYear(new Date(value), newYear).toUTCString());
		}
	};

	const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newYear = Number.parseInt(e.target.value, 10);
		if (!Number.isNaN(newYear) && newYear > 0 && newYear < 10000) {
			updateYear(newYear);
		}
	};

	const incrementYear = () => updateYear(date.getFullYear() + 1);
	const decrementYear = () => updateYear(date.getFullYear() - 1);

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					className={cn(
						"w-full justify-start text-left font-normal",
						!value && "text-muted-foreground",
					)}
				>
					<CalendarIcon className="mr-2 h-4 w-4" />
					{value ? format(value, "PPP") : <span>Pick a date</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<div className="flex items-center justify-between p-2 border-b">
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7"
						onClick={decrementYear}
					>
						<ChevronLeftIcon className="h-4 w-4" />
					</Button>
					<Input
						type="number"
						value={date.getFullYear()}
						onChange={handleYearChange}
						className="w-90 h-7 text-center"
					/>
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7"
						onClick={incrementYear}
					>
						<ChevronRightIcon className="h-4 w-4" />
					</Button>
				</div>
				<Calendar
					mode="single"
					selected={value ? new Date(value) : undefined}
					onSelect={(newDate) => {
						onChange(newDate?.toUTCString());
						setIsOpen(false);
					}}
					month={date}
					onMonthChange={setDate}
					initialFocus
					toDate={maxDate}
					fromDate={minDate}
				/>
			</PopoverContent>
		</Popover>
	);
}
