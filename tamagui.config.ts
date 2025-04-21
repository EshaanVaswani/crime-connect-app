import { createTamagui } from "tamagui";
import { config } from "@tamagui/config/v3";

// Minimal config (no fonts)
export default createTamagui({
   ...config,
   themes: {
      light: {
         background: "#ffffff",
         gray2: "#f5f5f5",
         gray10: "#525252",
         gray12: "#262626",
      },
   },
});
