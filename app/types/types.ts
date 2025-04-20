export type Report = {
   _id: string;
   incidentType: string;
   title: string;
   description: string;
   status: "pending" | "resolved";
   createdAt: string;
   dateTime: string;
   location: {
      address: string;
      coordinates: [number, number];
   };
   media: string[];
   anonymous: boolean;
   user?: {
      _id: string;
      phone: string;
      createdAt: string;
   };
   suspectDescription?: string;
   witnessDetails?: string;
};
