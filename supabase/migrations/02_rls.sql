-- enable RLS on all tables
alter table flights enable row level security;
alter table seats enable row level security;
alter table bookings enable row level security;
alter table passengers enable row level security;
alter table reschedules enable row level security;

-- flights: anyone can read
create policy "flights_read" on flights
  for select using (true);

-- seats: anyone can read
create policy "seats_read" on seats
  for select using (true);

-- bookings: users see only their own
create policy "bookings_own" on bookings
  for all using (auth.uid() = user_id);

-- passengers: users see only their own via booking
create policy "passengers_own" on passengers
  for all using (
    exists (
      select 1 from bookings
      where bookings.id = passengers.booking_id
      and bookings.user_id = auth.uid()
    )
  );

-- reschedules: users see only their own via booking
create policy "reschedules_own" on reschedules
  for all using (
    exists (
      select 1 from bookings
      where bookings.id = reschedules.booking_id
      and bookings.user_id = auth.uid()
    )
  );