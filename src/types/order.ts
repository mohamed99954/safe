export interface Location {
  address?: string;
  formatted_address?: string;
  name?: string;
  description?: string;
}

export interface Customer {
  first_name: string;
  last_name: string;
  phone?: string;
}

export interface Order {
  id: string;
  status:
    | "available"
    | "picked_up"
    | "in_transit"
    | "approaching"
    | "completed"
    | "cancelled";
  customer?: Customer;
  created_at: string;
  pickup_location: Location;
  dropoff_location: Location;
  price?: number;
  package_details?: string;
  notes?: string;
  driver_id?: string;
}
