import YouTubePlayerPlus from '../src/index'

describe('YouTubePlayerPlus', () => {
    let element: HTMLElement
    let player: YouTubePlayerPlus

    beforeEach(() => {
        element = document.createElement('div')
        document.body.appendChild(element)
        player = new YouTubePlayerPlus(element)
    })

    afterEach(() => {
        player.destroy()
    })

    test('Attaches to a DOM node', () => {
        expect(player.getState()).toBe("unstarted")
    })

    test('Invalid element', () => {
        expect(() => {
            new YouTubePlayerPlus('')
        }).toThrowError("'' is not a valid selector")
    })

    test('Test destroy', () => {
        player.destroy()
        expect(player.destroyed).toBe(true)
    })
})
