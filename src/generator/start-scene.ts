import {OctreeGrid} from "../octree/grid";

export function generateStartScene(grid: OctreeGrid) {
    grid.modify([0, 0, 0], [1023, 1023, 255], 1);
    grid.modify([0, 0, 0], [255, 1023, 511], 1);

    grid.modify([256 + 64, 256+128, 256], [256 + 64 + 64 -1, 256+128 +64-1, 319], 1);
    grid.modify([256 + 64, 256-128, 256], [256 + 64 + 64 -1, 256-128 +64-1, 319], 1);

    grid.modify([512 + 128, 768+64, 256], [512 + 128 + 64 -1, 768+128 -1, 319], 1);
    grid.modify([512 + 128, 768+64 -256, 256], [512 + 128 + 64 -1, 768-128 -1, 319], 1);

    grid.modify([256, 256, 256], [447, 256+64-1, 447], 2);
    grid.modify([576, 768 - 64, 256], [767, 831 -64, 447], 3);
    grid.modify([768, 0, 0], [1023, 1023, 511], 1);
    grid.modify([0, 512, 256], [255, 767, 511], 0);
    grid.modify([768, 256, 256], [1023, 511, 511], 0);
}