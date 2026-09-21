export class ElementResolver {
  /**
   * Find and trigger click on interactive element matching a query string
   */
  public static clickElementByLabel(targetLabel: string): boolean {
    if (typeof document === 'undefined') return false;
    const lower = targetLabel.toLowerCase().trim();
    if (!lower) return false;

    const interactiveElements = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, a, input[type="button"], input[type="submit"], [role="button"]'
      )
    );

    // 1. Exact Match
    for (const el of interactiveElements) {
      const text = (el.textContent || '').toLowerCase().trim();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase().trim();
      const title = (el.getAttribute('title') || '').toLowerCase().trim();
      if (text === lower || aria === lower || title === lower) {
        el.click();
        return true;
      }
    }

    // 2. Substring Match
    for (const el of interactiveElements) {
      const text = (el.textContent || '').toLowerCase().trim();
      const aria = (el.getAttribute('aria-label') || '').toLowerCase().trim();
      const title = (el.getAttribute('title') || '').toLowerCase().trim();
      if (text.includes(lower) || aria.includes(lower) || title.includes(lower)) {
        el.click();
        return true;
      }
    }

    return false;
  }

  /**
   * Selects an item by ordinal phrase ("first doctor", "second doctor", "third report")
   */
  public static selectOrdinalElement(phrase: string): boolean {
    if (typeof document === 'undefined') return false;
    const lower = phrase.toLowerCase();

    let targetIndex = 0;
    if (lower.includes('first') || lower.includes('1st')) targetIndex = 0;
    else if (lower.includes('second') || lower.includes('2nd')) targetIndex = 1;
    else if (lower.includes('third') || lower.includes('3rd')) targetIndex = 2;
    else if (lower.includes('fourth') || lower.includes('4th')) targetIndex = 3;

    // Detect context
    if (lower.includes('doctor')) {
      const doctorCards = Array.from(document.querySelectorAll<HTMLElement>('[data-doctor-card], .doctor-card, button:has(svg.lucide-stethoscope)'));
      if (doctorCards[targetIndex]) {
        doctorCards[targetIndex].click();
        doctorCards[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
    }

    if (lower.includes('report')) {
      const reportCards = Array.from(document.querySelectorAll<HTMLElement>('[data-report-item], button:has(svg.lucide-file-text)'));
      if (reportCards[targetIndex]) {
        reportCards[targetIndex].click();
        reportCards[targetIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
    }

    return false;
  }

  /**
   * Smooth page scrolling helper
   */
  public static scrollPage(direction: 'up' | 'down' | 'top' | 'bottom'): void {
    if (typeof window === 'undefined') return;
    if (direction === 'down') {
      window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
    } else if (direction === 'up') {
      window.scrollBy({ top: -window.innerHeight * 0.7, behavior: 'smooth' });
    } else if (direction === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (direction === 'bottom') {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }
}
