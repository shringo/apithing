import type { PropsWithChildren } from "react";

export default function PageLayout(props: PropsWithChildren<object>) {
    return (
        <main className="flex h-screen justify-center overflow-none">
            <div className="w-full md:max-w-2xl h-full overflow-y-scroll border-x border-slate-400">
                {props.children}
            </div>
        </main>
    )
}