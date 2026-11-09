import { Component, signal } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular/standalone';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent],
})
export class HomePage {
  // The dice face that is currently shown (1 to 6)
  value = signal<number>(1);
  rolling = signal<boolean>(false);

  // The 9 spots of a 3x3 grid, numbered like this:
  // 0 1 2
  // 3 4 5
  // 6 7 8
  cells = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  // Which spots have a dot for each dice face
  faces: { [key: number]: number[] } = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  private lastTap = 0;

  hasDot(cell: number): boolean {
    return this.faces[this.value()].includes(cell);
  }

  // Called on every tap. Two taps within 300ms count as a double tap.
  onTap() {
    const now = Date.now();
    if (now - this.lastTap < 300) {
      this.lastTap = 0;
      this.roll();
    } else {
      this.lastTap = now;
    }
  }

  async roll() {
    if (this.rolling()) {
      return;
    }
    this.rolling.set(true);

    // Show a few random faces quickly, with a small vibration each time
    for (let i = 0; i < 8; i++) {
      this.value.set(this.randomFace());
      await this.vibrate(() => Haptics.impact({ style: ImpactStyle.Light }));
      await this.wait(70);
    }

    // The final result
    this.value.set(this.randomFace());
    await this.vibrate(() => Haptics.notification({ type: NotificationType.Success }));
    this.rolling.set(false);
  }

  private randomFace(): number {
    return Math.floor(Math.random() * 6) + 1;
  }

  private wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Haptics may not work in some browsers, so ignore any errors
  private async vibrate(action: () => Promise<void>) {
    try {
      await action();
    } catch {}
  }
}
