import { delay } from "../../../utils.js";

(function() {
    'use strict';
    const wait = async(millis)=>(new Promise(resolve=>setTimeout(resolve,millis)));
    const debounce = (func, delay = 100)=>{
        let to;
        return (...args) => {
            if (to) clearTimeout(to);
            to = setTimeout(()=>func.apply(this, args), delay);
        };
    };

    let videoEl;

    Array.from(document.querySelectorAll('#bg1, #bg_custom')).forEach(it=>it.style.backgroundPosition = 'center');

    const replaceBg = async(muts = [])=>{
        console.log('[STVBG]', 'replaceBg', muts);
        await wait(1000);
        const el = document.querySelector('#bg1');
        const customEl = document.querySelector('#bg_custom');
        const bg = window.getComputedStyle(el).background;
        const bgUrl = bg.replace(/^.*?url\(['"]?([^'"\)]+)['"]\).*?$/, '$1');
        const customBg = window.getComputedStyle(customEl).background;
        const customUrl = customBg.replace(/^.*?url\(['"]?([^'"\)]+)['"]\).*?$/, '$1');
        let url;
        if (customUrl && customUrl != customBg) {
            url = customUrl;
        } else if (bgUrl && bgUrl != bg) {
            url = bgUrl;
        }
        console.log('[STVBG]', url);
        if (url.match(/^.+\.[a-z0-z]+\.[a-z0-9]+$/i)) {
            const vurl = url.replace(/^(.+\.[a-z0-z]+)\.[a-z0-9]+$/i, '$1');
            console.log('[STVBG]', vurl);
            const resp = await fetch(url, {
                method: 'HEAD',
            });
            console.log('[STVBG]', resp);
            if (resp.ok) {
                const v = document.createElement('video'); {
                    v.loop = true;
                    v.autoplay = true;
                    v.muted = true;
                    v.style.position = 'absolute';
                    v.style.height = '100%';
                    v.style.width = '100%';
                    v.style.objectFit = 'cover';
                    v.style.opacity = '0';
                    v.style.transition = '400ms linear';
                    v.src = vurl;
                }
                (customEl ?? el).append(v);
                await delay(20);
                v.style.opacity = '1';
                while (true) {
                    try {
                        await v.play();
                        break;
                    } catch(ex) {
                        await wait(100);
                    }
                }
                await delay(450);
                videoEl?.remove();
                videoEl = v;

            }
        } else if (videoEl) {
            videoEl.remove();
        }
    };
    replaceBg();

    const mo = new MutationObserver(debounce(replaceBg));
    mo.observe(document.querySelector('#bg1'), { attributes:true });
    mo.observe(document.querySelector('#bg_custom'), { attributes:true });
})();

$(document).ready(function () {
    const addSettings = () => {
        const html = `
		<div class="vbg--settings">
			<div class="inline-drawer">
				<div class="inline-drawer-toggle inline-drawer-header">
					<b>Video Backgrounds</b>
					<div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
				</div>
				<div class="inline-drawer-content" style="font-size:small;">
					<h2>How To Use</h2>
					<ol style="padding-left: 1.5em;">
						<li>
							Use your file explorer to place the video file you want to use into SillyTavern's backgrounds folder:
							<pre>.../SillyTavern/public/backgrounds/</pre>
						</li>
						<li>
							Place any image file with the exact same name (including the video's filename extension) plus the image files extension into the backgrounds folder.<br>
							Example:<br>
							video file: <code>MyVideo.mp4</code><br>
							image file: <code>MyVideo.mp4.jpg</code><br>&nbsp;
						</li>
						<li>
							Start / reload SillyTavern and select the image file as your background.
						</li>
					</ol>
				</div>
			</div>
		</div>
		`;
        $('#extensions_settings').append(html);
    };
    addSettings();
});
