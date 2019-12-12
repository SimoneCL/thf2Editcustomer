const PROXY_CONFIG = [
    {
        context: [
            "/totvs-rest",
            "/totvs-login",
            "/customer",
            "/country",
            "/contact"
        ],
        target: "http://localhost:3000",
        secure: false,
        changeOrigin: true,
        logLevel: "debug",
        autoRewrite: true
    }, {
        context: [
            "/josso",
            "/dts/datasul-rest"
        ],
        target: "http://cordas:8480",
        secure: false,
        changeOrigin: true,
        logLevel: "debug",
        autoRewrite: true,
        headers: {
            Cookie: "loginMode=normal; JOSSO_SESSIONID=BD6EAC0F745F156CF638735E869E4339; JSESSIONID=95B3D3C28256A738066A4701DE9BEBE4"
        }
    }
]

module.exports = PROXY_CONFIG;

