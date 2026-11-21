import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../bandSettings', () => ({ readSettings: () => ({ backlineStunServers: ['stun:stun.example:3478'], backlineMaxGuests: 2 }) }));

import { admitGuest, announce, clientFor, dropHost, hostFor, join, liveBackline, mayEnter, toClients, toHost } from './liveSession';
import { Mailbox } from './mailbox';

const backline = { instance: 'a', tokenHash: 'hash', public: true, pin: '123456', page: '<p>remote</p>' };
const member = { brontoSession: {} } as App.Locals;
const visitor = { brontoSession: null } as App.Locals;

describe('mailbox', () => {
    it('keeps messages until a later pull confirms them', async () => {
        const box = new Mailbox<string>();
        box.push('one');
        box.push('two');
        expect(await box.pull(0)).toEqual({ next: 2, items: ['one', 'two'] });
        expect(await box.pull(1)).toEqual({ next: 2, items: ['two'] });
    });

    it('answers a waiting pull as soon as a message arrives', async () => {
        const box = new Mailbox<string>();
        const pull = box.pull(0);
        box.push('late');
        expect(await pull).toEqual({ next: 1, items: ['late'] });
    });
});

describe('live session', () => {
    beforeEach(() => dropHost('hash'));

    it('is live once a Backline announces, with the page it sent', () => {
        expect(liveBackline()).toBeNull();
        expect(announce(backline)).toEqual({ next: 0, ice: ['stun:stun.example:3478'] });
        expect(liveBackline()).toEqual({ public: true, page: '<p>remote</p>' });
    });

    it('lets members in, and others with a guest token for the PIN when shared publicly', () => {
        expect(mayEnter(member, undefined)).toBe(false); // nothing is live
        announce(backline);
        expect(mayEnter(member, undefined)).toBe(true);
        expect(admitGuest('000000')).toBeNull();
        expect(admitGuest('')).toBeNull();
        const token = admitGuest('123456')!;
        expect(mayEnter(visitor, token)).toBe(true);
        expect(mayEnter(visitor, '123456')).toBe(false); // the PIN itself is no pass
        expect(mayEnter(visitor, 'made-up')).toBe(false);
        announce({ ...backline, public: false });
        expect(mayEnter(visitor, token)).toBe(false);
        expect(admitGuest('123456')).toBeNull();
    });

    it('drops guests when the PIN changes or another Backline announces', () => {
        announce(backline);
        const token = admitGuest('123456')!;
        announce({ ...backline, page: '<p>new page</p>' });
        expect(mayEnter(visitor, token)).toBe(true);
        announce({ ...backline, pin: '654321' });
        expect(mayEnter(visitor, token)).toBe(false);
        const next = admitGuest('654321')!;
        announce({ ...backline, pin: '654321', instance: 'b' });
        expect(mayEnter(visitor, next)).toBe(false);
    });

    it('passes messages both ways', async () => {
        announce(backline);
        const host = hostFor('a', 'hash');
        const id = join('Anna', false)!;
        toHost(id, ['{"t":"hello"}']);
        expect((await host.inbox.pull(0)).items).toEqual([{ c: id, join: 'Anna' }, { c: id, m: '{"t":"hello"}' }]);
        toClients([{ c: id, m: '{"t":"hi"}' }, { c: 'nobody', m: 'lost' }]);
        expect((await clientFor(id).inbox.pull(0)).items).toEqual(['{"t":"hi"}']);
    });

    it('kicks out the previous Backline and its browsers when another announces', () => {
        announce(backline);
        const id = join('Anna', false)!;
        announce({ ...backline, instance: 'b' });
        expect(() => hostFor('a', 'hash')).toThrow();
        expect(() => clientFor(id)).toThrow();
        expect(hostFor('b', 'hash').instance).toBe('b');
    });

    it('seats as many guests as band settings allow, and members always', () => {
        announce(backline);
        expect(join('Guest', true)).not.toBeNull();
        expect(join('Guest', true)).not.toBeNull();
        expect(join('Guest', true)).toBeNull();
        expect(join('Anna', false)).not.toBeNull();
    });
});
