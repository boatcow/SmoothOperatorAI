import type { NavigationProp, RouteProp } from '@react-navigation/native';

declare global {
    interface IRoute {
        key: string;
        title?: string;
        icon: string;
    }

    type NavigationParams = {
        Login: undefined;
        Dashboard: undefined;
    };

    type NavProp = NavigationProp<NavigationParams>;

    interface CustomerInfo {
        name: string;
        phone: string;
        current_address: number;
        destination_address: number;
        move_in_date: Date;
        move_out_date: Date;
        apartment_size: string;
        inventory: string[];
        packing_assistance: boolean;
        special_items: string;
    }

    interface Mover {
        name: string;
        phone: string;
        specialties: string[];
        base_price_range: number[];
    }

    interface Session {
        status: "info_collection" | "strategizing" | "negotiating" | "analyzing" | "completed";
        messages?: string[];
        customerInfo?: CustomerInfo;
        strategy?: string;
        strategies?: string[];
        movers?: Mover[];
        moverRationale?: string;
        transcripts?: string[];
        callSummaries?: string[];
        recommendation?: string;
    }
}