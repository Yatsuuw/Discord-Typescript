/**
 * 
 * @param level 
 * @param xp 
 * @returns
 */

export function Xp(level: number, xp: number) {

    //xp+= Math.floor(random(Math.sqrt(level + 1) * 10, Math.sqrt(level + 1) * 25));
    
    //if (xp > 100 * (level + 1)) {
        //level += 1;
        //xp = xp - ((level) * 100);
    //}

    //return { level: Math.floor(level), xp: Math.floor(xp) };

    const requiredXp = Math.pow(level + 1, 2) * 100;
    xp += 10;

    if (xp >= requiredXp) {
        level += 1;
        xp -= requiredXp;
    }

    return { level: Math.floor(level), xp: Math.floor(xp) };
}

/**
 * 
 * @param min 
 * @param max 
 * @returns 
 */
export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
