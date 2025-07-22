
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FinancialStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  textColor?: string;
}

const FinancialStatCard = ({ 
  title, 
  value, 
  icon, 
  description, 
  textColor = "text-gray-600" 
}: FinancialStatCardProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className={`${textColor} rounded-full p-2 bg-gray-100`}>
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialStatCard;
