import { $ } from "bun";

async function extractInstalledRustTargets() {
    const targetsExtracted = (
        await $`rustup target list -q --installed`.quiet()
    )
        .text()
        .trim()
        .split("\n");
    return targetsExtracted;
}

async function extractRustTargets() {
    const targetsExtracted = (await $`rustup target list -q`.quiet())
        .text()
        .trim()
        .split("\n");
    return targetsExtracted;
}

export const [targets, installedTargets] = await Promise.all([
    extractRustTargets(),
    extractInstalledRustTargets(),
]);

export async function maybeAddRustTarget(target: string) {
    if (installedTargets.includes(target)) {
    } else {
        await $`rustup target add ${target}`.quiet();
    }
}
