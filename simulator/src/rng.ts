export class SeededRng {
  private seed: number;

  constructor(seed: number | string) {
    this.seed = typeof seed === 'string' ? this.hashString(seed) : seed;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
    }
    return hash;
  }

  // Mulberry32
  public next(): number {
    this.seed += 0x6D2B79F5;
    let t = this.seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  // Box-Muller transform
  public nextGaussian(mean: number, std: number): number {
    const u = 1 - this.next();
    const v = 1 - this.next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * std + mean;
  }

  public nextBool(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat(min, max + 1));
  }
}
