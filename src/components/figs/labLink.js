import { scrollToSection } from "@/hooks/useTerm";

/** Open a tab of the key-research-interests demos (LabViewport listens for this). */
export function openLab(tab) {
  window.dispatchEvent(new CustomEvent("lab:open", { detail: tab }));
  scrollToSection("lab");
}
