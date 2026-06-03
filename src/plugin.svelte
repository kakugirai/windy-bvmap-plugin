<script context="module" lang="ts">
    // Module-level state: survives component open/close/navigate cycles
    import { map, layerOrder } from '@windy/map';

    let _layer: any = null;
    let _opacity = 1.0;

    const GSI_URL = 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png';

    // At this zoom and above: show GSI 淡色地図 above the outdoor map.
    // Below this: hide the GSI layer and let Windy show its default view.
    const HIGH_ZOOM = 10;

    const isHighZoom = () => ((map as any).getZoom?.() ?? 0) >= HIGH_ZOOM;

    const handleZoom = () => {
        if (_layer) _layer.visible = isHighZoom();
    };

    export const gsiAdd = () => {
        if (_layer) return;
        _layer = new L.TileLayer(GSI_URL, {
            opacity: _opacity,
            attribution: '国土地理院',
            maxZoom: 18,
            maxNativeZoom: 18,
            // Always above the outdoor trekking map; visibility controlled by zoom.
            layerBucketId: layerOrder.AIRSPACES,
        } as any);
        (map as any).addLayer(_layer);
        _layer.visible = isHighZoom();
        (map as any).on('zoomend', handleZoom);
    };

    export const gsiRemove = () => {
        if (!_layer) return;
        (map as any).off('zoomend', handleZoom);
        try { (map as any).removeLayer(_layer); } catch {}
        _layer = null;
    };

    export const gsiSetOpacity = (v: number) => {
        _opacity = v;
        _layer?.setOpacity?.(v);
    };

    export const gsiIsActive = () => !!_layer;
</script>

<div class="plugin__mobile-header">地理院淡色地図</div>

<section class="plugin__content">
    <div
        class="plugin__title plugin__title--chevron-back"
        on:click={() => bcast.emit('rqstOpen', 'menu')}
    >
        地理院淡色地図
    </div>

    <div class="mt-15">
        <label class="plugin-switch">
            <input type="checkbox" bind:checked={visible} on:change={onToggle} />
            <span class="plugin-switch__slider"></span>
            <span class="size-s ml-10">淡色地図を表示</span>
        </label>
    </div>

    {#if visible}
        <div class="mt-15">
            <div class="size-xs mb-5">不透明度: {Math.round(opacity * 100)}%</div>
            <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                bind:value={opacity}
                on:input={onOpacityChange}
                style="width: 100%"
            />
        </div>
    {/if}

    {#if error}
        <small class="rounded-box bg-error size-s mt-10 block">{error}</small>
    {/if}

    <small class="size-xxs mt-20 block" style="line-height: 1.5">
        出典:
        <a
            href="https://maps.gsi.go.jp/development/ichiran.html"
            class="clickable dotted"
            target="_top"
        >国土地理院</a>
    </small>
</section>

<script lang="ts">
    import bcast from '@windy/broadcast';
    import config from './pluginConfig';

    void config;

    // Reflect the persistent state into this component instance's UI
    let visible = gsiIsActive();
    let opacity = _opacity;
    let error: string | null = null;

    const onToggle = () => {
        error = null;
        try {
            if (visible) {
                gsiAdd();
            } else {
                gsiRemove();
            }
        } catch (e: unknown) {
            error = e instanceof Error ? e.message : String(e);
            visible = gsiIsActive(); // revert UI to actual state
        }
    };

    const onOpacityChange = () => {
        gsiSetOpacity(opacity);
    };

    export const onopen = (_params: unknown) => {
        // Sync UI to the persistent layer state (layer may already be active
        // from a previous open, or may have been added before navigation)
        visible = gsiIsActive();
        opacity = _opacity;
        if (!visible) {
            visible = true;
            try {
                gsiAdd();
            } catch (e: unknown) {
                error = e instanceof Error ? e.message : String(e);
                visible = false;
            }
        }
    };

    // onDestroy intentionally omitted — the tile layer outlives the panel
</script>

<style lang="less">
    .plugin-switch {
        display: flex;
        align-items: center;
        cursor: pointer;

        input {
            display: none;
        }

        &__slider {
            position: relative;
            display: inline-block;
            width: 36px;
            height: 20px;
            background: #ccc;
            border-radius: 10px;
            transition: background 0.2s;
            flex-shrink: 0;

            &::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                transition: transform 0.2s;
            }
        }

        input:checked ~ &__slider {
            background: #0069d9;

            &::after {
                transform: translateX(16px);
            }
        }
    }
</style>
