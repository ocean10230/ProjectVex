export async function Sandbox(raw: string) {
    return new Promise((resolve) => {
        const code = raw.replaceAll("await import('npm:", "await import('https://esm.sh/");
        
        const iframe = document.createElement("iframe");
        iframe.src = chrome.runtime.getURL("/sandbox.html");

        iframe.sandbox.add("allow-scripts", "allow-same-origin");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        const sandbox_channel = new MessageChannel();
        let sandbox_port = sandbox_channel.port1;

        sandbox_port.onmessage = e => {
            iframe.remove();
            resolve(e.data ?? JSON.stringify({ type: "error", message: "Sandbox returned empty response" }));
        };

        iframe.onload = () => {
            iframe.contentWindow?.postMessage(code, "*", [sandbox_channel.port2]);
        };
    });
}