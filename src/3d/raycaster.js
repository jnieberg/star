import { EVENT, TD } from "../variables";
import setLabel from "./label/label";
import drawStar, { getStarInfoString } from "./bodies/star";

function distanceToCamera(x, y, z) {
    var cx = TD.camera.position.x;
    var cy = TD.camera.position.y;
    var cz = TD.camera.position.z;
    var distance = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy) + (z - cz) * (z - cz));
    return distance;
}

function raycastEvents(intersect) {
    var index = intersect.index;
    if (index) {
        //star
        var star = TD.stars.list[index];
        if (star) {
            // star info
            if (intersect.distance < 10) {
                var pos = TD.stars.positions;
                setLabel(getStarInfoString(star));
                TD.label.position.set(pos[index * 3], pos[index * 3 + 1], pos[index * 3 + 2]);
            }
        }
        // near star
        if (intersect.distance > TD.cameraNear && intersect.distance < 10) {
            if (TD.star.this !== star) {
                TD.star.this = star;
                drawStar();
            }
        }
    }
}

export default function raycast(obj) {
    if (obj) {
        TD.raycaster.setFromCamera(EVENT.mouse, TD.camera);
        var intersects = TD.raycaster.intersectObject(obj, true);
        if (intersects.length > 0) {
            raycastEvents(intersects[0]);
        } else {
            setLabel();
        }
        if (TD.star.this) {
            var starDistance = distanceToCamera(TD.star.this.x * 100, TD.star.this.y * 100, TD.star.this.z * 100);
            if (starDistance > 10) {
                TD.star.this = undefined;
                EVENT.controls.speedFactor = 1;
            } else {
                EVENT.controls.speedFactor = starDistance > TD.cameraNear ? starDistance * 0.1 - TD.cameraNear : 1;
            }
        }
    }
}