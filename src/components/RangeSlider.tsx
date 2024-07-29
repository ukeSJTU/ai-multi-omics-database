import React from "react";
import { Range, getTrackBackground } from "react-range";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface RangeSliderProps {
  min: number;
  max: number;
  values: number[];
  onChange: (values: number[]) => void;
  ticks: number[];
  onStepLeft: (isMin: boolean) => void;
  onStepRight: (isMin: boolean) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  values,
  onChange,
  ticks,
  onStepLeft,
  onStepRight,
}) => {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            onClick={() => onStepLeft(true)}
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            onClick={() => onStepRight(true)}
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex-grow px-2 py-4">
          <Range
            step={1}
            min={min}
            max={max}
            values={values}
            onChange={onChange}
            renderTrack={({ props, children }) => (
              <div
                onMouseDown={props.onMouseDown}
                onTouchStart={props.onTouchStart}
                className="h-7 flex w-full"
              >
                <div
                  ref={props.ref}
                  className="h-1 w-full rounded-full self-center relative"
                  style={{
                    background: getTrackBackground({
                      values,
                      colors: ["#e0e0e0", "#000000", "#e0e0e0"],
                      min,
                      max,
                    }),
                  }}
                >
                  {children}
                </div>
              </div>
            )}
            renderThumb={({ props }) => (
              <div
                {...props}
                className="h-4 w-4 rounded-full bg-white border-2 border-black shadow focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                style={{
                  ...props.style,
                  boxShadow: "0 0 0 3px rgba(0, 0, 0, 0.1)",
                }}
              />
            )}
          />
          <div className="relative w-full h-1">
            {ticks.map((tick, index) => (
              <div
                key={index}
                className="absolute h-2 w-0.5 bg-gray-400"
                style={{
                  left: `${((tick - min) / (max - min)) * 100}%`,
                  transform: "translateX(-50%)",
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            onClick={() => onStepLeft(false)}
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button
            onClick={() => onStepRight(false)}
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>{values[0].toFixed(0)}</span>
        <span>{values[1].toFixed(0)}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
